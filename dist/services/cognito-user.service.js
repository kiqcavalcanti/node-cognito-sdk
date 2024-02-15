"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitoUserService = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const cognito_base_service_1 = require("./cognito-base.service");
const errors_1 = require("../errors");
class CognitoUserService extends cognito_base_service_1.CognitoBaseService {
    constructor(userPoolId, region, credentials, apiUrl) {
        super(userPoolId, region, credentials);
        this.apiUrl = apiUrl;
    }
    async getUserInfoByToken(token) {
        try {
            return await this.cognitoClient.send(new client_cognito_identity_provider_1.GetUserCommand({
                AccessToken: token,
            }));
        }
        catch (e) {
            throw new errors_1.CognitoApiError('Unable to get user info', e.message, e.$metadata.httpStatusCode);
        }
    }
    async adminGetUserInfo(username) {
        const params = {
            UserPoolId: this.userPoolId,
            Username: username,
        };
        try {
            return await this.cognitoClient.send(new client_cognito_identity_provider_1.AdminGetUserCommand(params));
        }
        catch (e) {
            throw new errors_1.CognitoApiError('Unable to get user info', e.message, e.$metadata.httpStatusCode);
        }
    }
    async createUser(data) {
        const params = {
            UserPoolId: this.userPoolId,
            Username: data.username,
            TemporaryPassword: data.password,
            UserAttributes: this.getUserAttributes(data),
        };
        try {
            return await this.cognitoClient.send(new client_cognito_identity_provider_1.AdminCreateUserCommand({
                ...params,
                DesiredDeliveryMediums: ['EMAIL'],
                // MessageAction: 'RESEND',
            }));
        }
        catch (e) {
            console.log(e);
            throw new errors_1.CognitoApiError('Unable to create user', e.message, e.$metadata.httpStatusCode);
        }
    }
    async adminDefineUserPassword(data) {
        try {
            await this.cognitoClient.send(new client_cognito_identity_provider_1.AdminSetUserPasswordCommand({
                UserPoolId: this.userPoolId,
                Username: data.username,
                Password: data.password,
                Permanent: data.permanent,
            }));
        }
        catch (e) {
            throw new errors_1.CognitoApiError('Unable to change user password', e.message, e.$metadata.httpStatusCode);
        }
    }
    async changeUserPassword(data) {
        try {
            await this.cognitoClient.send(new client_cognito_identity_provider_1.ChangePasswordCommand({
                AccessToken: data.accessToken,
                PreviousPassword: data.previousPassword,
                ProposedPassword: data.newPassword,
            }));
        }
        catch (e) {
            throw new errors_1.CognitoApiError('Unable to change user password', e.message, e.$metadata.httpStatusCode);
        }
    }
    getUserAttributes(data) {
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
    async updateUserAttributes(data) {
        const params = {
            UserPoolId: this.userPoolId,
            Username: data.username,
            UserAttributes: this.getUserAttributes(data),
        };
        try {
            return await this.cognitoClient.send(new client_cognito_identity_provider_1.AdminUpdateUserAttributesCommand({
                ...params,
            }));
        }
        catch (e) {
            throw new errors_1.CognitoApiError('Unable to update user', e.message, e.$metadata.httpStatusCode);
        }
    }
    async adminDeleteUser(data) {
        const params = {
            UserPoolId: this.userPoolId,
            Username: data.username,
        };
        try {
            return await this.cognitoClient.send(new client_cognito_identity_provider_1.AdminDeleteUserCommand(params));
        }
        catch (e) {
            throw new errors_1.CognitoApiError('Unable to delete user', e.message, e.$metadata.httpStatusCode);
        }
    }
    async adminListUsers(dto) {
        try {
            return await this.cognitoClient.send(new client_cognito_identity_provider_1.ListUsersCommand({
                UserPoolId: this.userPoolId,
                Limit: dto.perPage,
                PaginationToken: dto.nextPage
                    ? dto.nextPage.replaceAll(' ', '+')
                    : undefined,
                Filter: dto.search,
            }));
        }
        catch (e) {
            console.log(e);
            throw new errors_1.CognitoApiError('Unable to list users', e.message, e.$metadata?.httpStatusCode);
        }
    }
}
exports.CognitoUserService = CognitoUserService;
