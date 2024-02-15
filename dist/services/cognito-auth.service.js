"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitoAuthService = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const crypto_1 = require("crypto");
const cognito_base_service_1 = require("./cognito-base.service");
const errors_1 = require("../errors");
const token_validation_service_1 = require("./token-validation.service");
const cognito_user_service_1 = require("./cognito-user.service");
const axios_1 = require("axios");
class CognitoAuthService extends cognito_base_service_1.CognitoBaseService {
    constructor(userPoolId, region, credentials, cognitoDomainUrl, cognitoIdpUrl, cacheService = null) {
        super(userPoolId, region, credentials);
        this.cognitoDomainUrl = cognitoDomainUrl;
        this.cognitoIdpUrl = cognitoIdpUrl;
        this.cacheService = cacheService;
        this.tokenValidationService = new token_validation_service_1.TokenValidationService(cognitoIdpUrl, userPoolId, cacheService);
        this.cognitoUserService = new cognito_user_service_1.CognitoUserService(userPoolId, region, credentials, '');
    }
    async createM2MToken(data) {
        const body = new URLSearchParams();
        body.append('grant_type', 'client_credentials');
        body.append('scope', data.scopes.join(' '));
        const url = this.cognitoDomainUrl + '/oauth2/token';
        try {
            const request = await axios_1.default.post(url, body, {
                auth: {
                    username: data.clientId,
                    password: data.clientSecret,
                },
            });
            return {
                accessToken: request.data.access_token,
                tokenType: request.data.token_type,
                expiresIn: request.data.expires_in,
            };
        }
        catch (e) {
            throw new errors_1.Oauth2TokenError('Unable to create M2M token', e.message, e.response?.status, e.response?.data);
        }
    }
    async tokenInfo(data) {
        const tokenData = await this.tokenValidationService.validateToken(data.token);
        if (!tokenData.username) {
            return tokenData;
        }
        if (this.cacheService) {
            const logoutTime = await this.cacheService.get(tokenData.sub);
            const currentTokenCreatedDate = new Date(tokenData.iat * 1000);
            if (logoutTime && new Date(logoutTime) > currentTokenCreatedDate) {
                throw new errors_1.RevokedTokenError('Access Token has been revoked');
            }
        }
        try {
            if (data.verifyRevoked) {
                await this.cognitoUserService.getUserInfoByToken(data.token);
            }
        }
        catch (e) {
            throw new errors_1.RevokedTokenError('Access Token has been revoked');
        }
        return tokenData;
    }
    async globalLogout(data) {
        const command = new client_cognito_identity_provider_1.GlobalSignOutCommand({
            AccessToken: data.token,
        });
        try {
            await this.cognitoClient.send(command);
            return true;
        }
        catch (e) {
            throw new errors_1.CognitoApiError('Unable logout user', e.message, e.$metadata.httpStatusCode);
        }
    }
    async adminInitiateAuth(data) {
        try {
            return await this.cognitoClient.send(new client_cognito_identity_provider_1.AdminInitiateAuthCommand({
                AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
                ClientId: data.clientId,
                UserPoolId: this.userPoolId,
                AuthParameters: {
                    USERNAME: data.username,
                    PASSWORD: data.password,
                    SECRET_HASH: this.getSecretHash(data.clientId, data.clientSecret, data.username),
                },
            }));
        }
        catch (e) {
            throw new errors_1.CognitoApiError('Unable to create token', e.message, e.$metadata.httpStatusCode);
        }
    }
    async exchangeCodeForToken(data) {
        try {
            const body = {
                grant_type: 'authorization_code',
                client_id: data.clientId,
                code: data.code,
                redirect_uri: data.redirectUri,
            };
            let config = {};
            if (data.clientSecret) {
                config = {
                    auth: {
                        username: data.clientId,
                        password: data.clientSecret,
                    },
                };
            }
            const tokenEndpoint = this.cognitoDomainUrl + '/oauth2/token';
            const request = await axios_1.default.post(tokenEndpoint, new URLSearchParams(body), config);
            return {
                idToken: request.data.id_token,
                accessToken: request.data.accessToken,
                tokenType: request.data.token_type,
                expiresIn: request.data.expires_in,
            };
        }
        catch (e) {
            throw new errors_1.Oauth2TokenError('Unable to exchange code for token', e.message, e.response?.status, e.response?.data);
        }
    }
    getLoginUrl(data) {
        const scopes = data.scopes ?? ['email', 'phone', 'openid', 'profile'];
        const queryParams = {
            client_id: data.clientId,
            response_type: 'code',
            scopes: scopes.join(' '),
            redirect_uri: data.redirectUri,
        };
        const queryString = Object.entries(queryParams)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        const url = this.cognitoDomainUrl + '/oauth2/authorize?' + queryString;
        return { url };
    }
    getLogoutUrl(data) {
        const queryParams = {
            client_id: data.clientId,
            logout_uri: data.logoutUri,
        };
        const queryString = Object.entries(queryParams)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        const url = this.cognitoDomainUrl + '/logout?' + queryString;
        return { url };
    }
    getSecretHash(clientId, clientSecret, username) {
        const hmac = (0, crypto_1.createHmac)('sha256', clientSecret);
        hmac.update(username + clientId);
        return hmac.digest('base64');
    }
}
exports.CognitoAuthService = CognitoAuthService;
