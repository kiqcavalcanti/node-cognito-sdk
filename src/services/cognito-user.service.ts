import {
  ChangePasswordCommand,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { AwsCredentials, CognitoBaseService } from './cognito-base.service';
import { CognitoApiError } from '../errors';
import axios from 'axios';
import {
  GetUserInfoOutput,
  GetUserInfoOutputPaginate,
} from '../interfaces/outputs/cognito-user-service-outputs.interfaces';
import {
  AdminChangePasswordInput,
  AdminCreateUserInput,
  AdminUpdateUserInput,
} from '../interfaces/inputs';

export class CognitoUserService extends CognitoBaseService {
  constructor(
    userPoolId: string,
    region: string,
    credentials: AwsCredentials,
    protected comercAuthApiUrl: string,
  ) {
    super(userPoolId, region, credentials);
  }

  async getUserInfoByToken(token: string): Promise<GetUserInfoOutput> {
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
      return true;
    } catch (e) {
      throw new CognitoApiError(
        'Unable to change user password',
        e.message,
        e.$metadata.httpStatusCode,
      );
    }
  }

  async adminCreateUser(
    m2mToken: string,
    input: AdminCreateUserInput,
  ): Promise<GetUserInfoOutput> {
    try {
      const response = await axios.post(
        `${this.comercAuthApiUrl}/api/admin/users`,
        input,
        {
          headers: {
            Authorization: `Bearer ${m2mToken}`,
          },
        },
      );

      return this.getUserInfoOutput(response.data);
    } catch (error) {
      throw new CognitoApiError(
        'Unable to create user',
        error.message,
        error.response?.status,
      );
    }
  }

  async adminUpdateUser(m2mToken: string, input: AdminUpdateUserInput) {
    try {
      const url = `${this.comercAuthApiUrl}/api/admin/users/${input.username}`;
      await axios.patch(url, input, {
        headers: {
          Authorization: `Bearer ${m2mToken}`,
        },
      });
      return this.adminGetUserInfo(m2mToken, input.username);
    } catch (error) {
      throw new CognitoApiError(
        'Unable to update user',
        error.message,
        error.response?.status,
      );
    }
  }

  async adminGetUserInfo(m2mToken: string, username: string) {
    try {
      const response = await axios.get(
        `${this.comercAuthApiUrl}/api/admin/users/${username}`,
        {
          headers: {
            Authorization: `Bearer ${m2mToken}`,
          },
        },
      );

      return this.getUserInfoOutput(response.data);
    } catch (error) {
      throw new CognitoApiError(
        'Unable to get user info',
        error.message,
        error.response?.status,
      );
    }
  }

  async adminListUser(
    m2mToken: string,
    perPage: number = 10,
    nextPage: string = '',
  ): Promise<GetUserInfoOutputPaginate> {
    try {
      const response = await axios.get(
        `${this.comercAuthApiUrl}/api/admin/users`,
        {
          params: { per_page: perPage, next_page: nextPage },
          headers: {
            Authorization: `Bearer ${m2mToken}`,
          },
        },
      );

      const paginate = response.data;

      const nextToken = paginate.meta?.next_token || '';

      const paginateItems = paginate.data.items.map((item) =>
        this.getUserInfoOutputPaginate(item),
      );

      return {
        items: paginateItems,
        meta: {
          nextPage: nextToken,
        },
      };
    } catch (error) {
      throw new CognitoApiError(
        'Unable to list users',
        error.message,
        error.response?.status,
      );
    }
  }

  async adminChangeUserPassword(
    m2mToken: string,
    input: AdminChangePasswordInput,
  ) {
    try {
      await axios.post(
        `${this.comercAuthApiUrl}/api/admin/users/${input.username}/change-password`,
        {
          password: input.password,
          password_temporary:
            typeof input.passwordTemporary === 'boolean'
              ? input.passwordTemporary
              : false,
        },
        {
          headers: {
            Authorization: `Bearer ${m2mToken}`,
          },
        },
      );

      return true;
    } catch (error) {
      throw new CognitoApiError(
        'Unable to change user password',
        error.message,
        error.response?.status,
      );
    }
  }

  async adminDeleteUser(m2mToken: string, username: string) {
    try {
      await axios.delete(
        `${this.comercAuthApiUrl}/api/admin/users/${username}`,
        {
          headers: {
            Authorization: `Bearer ${m2mToken}`,
          },
        },
      );

      return true;
    } catch (error) {
      throw new CognitoApiError(
        'Unable to delete user',
        error.message,
        error.response?.status,
      );
    }
  }

  protected getUserInfoOutput(user: any): GetUserInfoOutput {
    return {
      id: user.data.sub,
      username: user.data.username,
      name: user.data.name || '',
      email: user.data.email || '',
      emailVerified: user.data.email_verified === 'true',
      phoneNumber: user.data.phone_number || '',
      phoneNumberVerified: user.data.phone_number_verified === 'true',
      birthDate: user.data.birthdate || '',
      picture: user.data.picture || '',
    };
  }

  protected getUserInfoOutputPaginate(user: any): GetUserInfoOutput {
    return {
      id: user.sub,
      username: user.username,
      name: user.name || '',
      email: user.email || '',
      emailVerified: user.email_verified === 'true',
      phoneNumber: user.phone_number || '',
      phoneNumberVerified: user.phone_number_verified === 'true',
      birthDate: user.birthdate || '',
      picture: user.picture || '',
    };
  }

  protected prepareUserResponseData(data: any): GetUserInfoOutput {
    const preparedData: any = {};

    for (const [key, value] of Object.entries(data)) {
      if (key === 'UserAttributes') {
        for (const userAttribute of data[key]) {
          preparedData.attributes[userAttribute.Name] = userAttribute.Value;
        }
        continue;
      }

      preparedData[this.toSnakeCase(key)] = value;
    }

    return {
      id: preparedData.attributes.sub,
      username: preparedData.username,
      name: preparedData.attributes.name || '',
      email: preparedData.attributes.email || '',
      emailVerified: preparedData.attributes.email_verified === 'true',
      phoneNumber: preparedData.attributes.phone_number || '',
      phoneNumberVerified:
        preparedData.attributes.phone_number_verified === 'true',
      birthDate: preparedData.attributes.birthdate || '',
      picture: preparedData.attributes.picture || '',
    };
  }

  protected toSnakeCase(key: string) {
    let cleanedString = key.replace(/[^\w\s]/gi, '');

    cleanedString = cleanedString.replace(/\s+/g, '_').toLowerCase();

    return cleanedString;
  }
}
