import {
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminDeleteUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  ChangePasswordCommand,
  GetUserCommand,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { AwsCredentials, CognitoBaseService } from './cognito-base.service';
import { CognitoApiError } from '../errors';

export class CognitoUserService extends CognitoBaseService {
  constructor(
    userPoolId: string,
    region: string,
    credentials: AwsCredentials,
    protected apiUrl: string,
  ) {
    super(userPoolId, region, credentials);
  }

  async getUserInfoByToken(token: string) {
    try {
      return await this.cognitoClient.send(
        new GetUserCommand({
          AccessToken: token,
        }),
      );
    } catch (e) {
      throw new CognitoApiError(
        'Unable to get user info',
        e.message,
        e.$metadata.httpStatusCode,
      );
    }
  }

  async adminGetUserInfo(username: string) {
    const params = {
      UserPoolId: this.userPoolId,
      Username: username,
    };

    try {
      return await this.cognitoClient.send(new AdminGetUserCommand(params));
    } catch (e) {
      throw new CognitoApiError(
        'Unable to get user info',
        e.message,
        e.$metadata.httpStatusCode,
      );
    }
  }

  async createUser(data: {
    username: string;
    password: string;
    email: string;
    name: string;
    picture: string;
    phoneNumber: string;
    birthDate: string;
  }) {
    const params = {
      UserPoolId: this.userPoolId,
      Username: data.username,
      TemporaryPassword: data.password,
      UserAttributes: this.getUserAttributes(data),
    };

    try {
      return await this.cognitoClient.send(
        new AdminCreateUserCommand({
          ...params,
          DesiredDeliveryMediums: ['EMAIL'],
          // MessageAction: 'RESEND',
        }),
      );
    } catch (e) {
      console.log(e);
      throw new CognitoApiError(
        'Unable to create user',
        e.message,
        e.$metadata.httpStatusCode,
      );
    }
  }

  async adminDefineUserPassword(data: {
    username: string;
    password: string;
    permanent: boolean;
  }) {
    try {
      await this.cognitoClient.send(
        new AdminSetUserPasswordCommand({
          UserPoolId: this.userPoolId,
          Username: data.username,
          Password: data.password,
          Permanent: data.permanent,
        }),
      );
    } catch (e) {
      throw new CognitoApiError(
        'Unable to change user password',
        e.message,
        e.$metadata.httpStatusCode,
      );
    }
  }

  async changeUserPassword(data: {
    previousPassword: string;
    newPassword: string;
    accessToken: string;
  }) {
    try {
      await this.cognitoClient.send(
        new ChangePasswordCommand({
          AccessToken: data.accessToken,
          PreviousPassword: data.previousPassword,
          ProposedPassword: data.newPassword,
        }),
      );
    } catch (e) {
      throw new CognitoApiError(
        'Unable to change user password',
        e.message,
        e.$metadata.httpStatusCode,
      );
    }
  }

  protected getUserAttributes(data: {
    email: string;
    picture: string;
    phoneNumber: string;
    birthDate: string;
  }) {
    const userAttributes = [
      {
        Name: 'email',
        Value: data.email,
      },
    ];

    if (data.birthDate) {
      userAttributes.push({
        Name: 'birthdate',
        Value: data.birthDate,
      });
    }

    if (data.phoneNumber) {
      userAttributes.push({
        Name: 'phone_number',
        Value: data.phoneNumber,
      });
    }

    if (data.picture) {
      userAttributes.push({
        Name: 'picture',
        Value: data.picture,
      });
    }

    return userAttributes;
  }

  async updateUserAttributes(data: {
    username: string;
    email: string;
    name: string;
    picture: string;
    phoneNumber: string;
    birthDate: string;
  }) {
    const params = {
      UserPoolId: this.userPoolId,
      Username: data.username,
      UserAttributes: this.getUserAttributes(data),
    };

    try {
      return await this.cognitoClient.send(
        new AdminUpdateUserAttributesCommand({
          ...params,
        }),
      );
    } catch (e) {
      throw new CognitoApiError(
        'Unable to update user',
        e.message,
        e.$metadata.httpStatusCode,
      );
    }
  }

  async adminDeleteUser(data: { username: string }) {
    const params = {
      UserPoolId: this.userPoolId,
      Username: data.username,
    };

    try {
      return await this.cognitoClient.send(new AdminDeleteUserCommand(params));
    } catch (e) {
      throw new CognitoApiError(
        'Unable to delete user',
        e.message,
        e.$metadata.httpStatusCode,
      );
    }
  }

  async adminListUsers(dto: {
    perPage: number;
    nextPage: string;
    search: string;
  }) {
    try {
      return await this.cognitoClient.send(
        new ListUsersCommand({
          UserPoolId: this.userPoolId,
          Limit: dto.perPage,
          PaginationToken: dto.nextPage
            ? dto.nextPage.replaceAll(' ', '+')
            : undefined,
          Filter: dto.search,
        }),
      );
    } catch (e) {
      console.log(e);
      throw new CognitoApiError(
        'Unable to list users',
        e.message,
        e.$metadata?.httpStatusCode,
      );
    }
  }
}
