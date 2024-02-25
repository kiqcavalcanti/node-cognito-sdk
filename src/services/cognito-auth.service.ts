import { AdminInitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { createHmac } from 'crypto';
import {
  CacheServiceInterface,
  CreateM2mTokenOutput,
  CreateTokenOutput,
  ExchangeCodeForTokenOutput,
  GetLoginUrlOutput,
  GetLogoutUrlOutput,
} from '../interfaces';
import { AwsCredentials, CognitoBaseService } from './cognito-base.service';
import {
  CognitoApiError,
  Oauth2TokenError,
  RevokedTokenError,
} from '../errors';
import {
  AdminInitiateAuthInput,
  CreateM2MTokenInput,
  ExchangeCodeForTokenInput,
  GetLoginUrlInput,
  GetLogoutUrlInput,
  GlobalLogoutInput,
  TokenInfoInput,
} from '../interfaces/inputs';
import { TokenValidationService } from './token-validation.service';
import { CognitoUserService } from './cognito-user.service';
import axios from 'axios';

export class CognitoAuthService extends CognitoBaseService {
  protected readonly tokenValidationService: TokenValidationService;
  protected readonly cognitoUserService: CognitoUserService;
  constructor(
    userPoolId: string,
    region: string,
    credentials: AwsCredentials,
    protected cognitoDomainUrl: string,
    protected cognitoIdpUrl: string,
    protected comercAuthApiUrl: string,
    protected cacheService: CacheServiceInterface = null,
  ) {
    super(userPoolId, region, credentials);

    this.tokenValidationService = new TokenValidationService(
      cognitoIdpUrl,
      userPoolId,
      cacheService,
    );

    this.cognitoUserService = new CognitoUserService(
      userPoolId,
      region,
      credentials,
      this.comercAuthApiUrl,
    );
  }

  public async createM2MToken(
    data: CreateM2MTokenInput,
  ): Promise<CreateM2mTokenOutput> {
    const body = new URLSearchParams();
    body.append('grant_type', 'client_credentials');
    body.append('scope', data.scopes.join(' '));

    const url = this.cognitoDomainUrl + '/oauth2/token';

    try {
      const request = await axios.post(url, body, {
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
    } catch (e) {
      throw new Oauth2TokenError(
        'Unable to create M2M token',
        e.message,
        e.response?.status,
        e.response?.data,
      );
    }
  }

  async tokenInfo(data: TokenInfoInput) {
    const tokenData = await this.tokenValidationService.validateToken(
      data.token,
    );

    if (!tokenData.username) {
      return tokenData;
    }

    if (this.cacheService) {
      const logoutTime: string = await this.cacheService.get(tokenData.sub);

      const currentTokenCreatedDate = new Date(tokenData.iat * 1000);

      if (logoutTime && new Date(logoutTime) > currentTokenCreatedDate) {
        throw new RevokedTokenError('Access Token has been revoked');
      }
    }

    try {
      if (
        (data.verifyRevoked || !this.cacheService) &&
        tokenData.tokenUse === 'access'
      ) {
        await this.cognitoUserService.getUserInfoByToken(data.token);
      }
    } catch (e) {
      throw new RevokedTokenError('Access Token has been revoked');
    }

    return tokenData;
  }

  async globalLogout(data: GlobalLogoutInput): Promise<boolean> {
    const url = this.comercAuthApiUrl + '/api/auth/global-logout';

    const body = {
      access_token: data.token,
    };

    try {
      await axios.post(url, body);

      return true;
    } catch (e) {
      throw new Oauth2TokenError(
        'Unable to revoke token',
        e.message,
        e.response?.status,
        e.response?.data,
      );
    }
  }
  async adminInitiateAuth(
    data: AdminInitiateAuthInput,
  ): Promise<CreateTokenOutput> {
    try {
      const request = await this.cognitoClient.send(
        new AdminInitiateAuthCommand({
          AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
          ClientId: data.clientId,
          UserPoolId: this.userPoolId,
          AuthParameters: {
            USERNAME: data.username,
            PASSWORD: data.password,
            SECRET_HASH: this.getSecretHash(
              data.clientId,
              data.clientSecret,
              data.username,
            ),
          },
        }),
      );

      return {
        idToken: request.AuthenticationResult.IdToken,
        accessToken: request.AuthenticationResult.AccessToken,
        expiresIn: request.AuthenticationResult.ExpiresIn,
        tokenType: request.AuthenticationResult.TokenType,
      };
    } catch (e) {
      throw new CognitoApiError(
        'Unable to create token',
        e.message,
        e.$metadata.httpStatusCode,
      );
    }
  }

  async exchangeCodeForToken(
    data: ExchangeCodeForTokenInput,
  ): Promise<ExchangeCodeForTokenOutput> {
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

      const request = await axios.post(
        tokenEndpoint,
        new URLSearchParams(body),
        config,
      );

      return {
        idToken: request.data.id_token,
        accessToken: request.data.access_token,
        tokenType: request.data.token_type,
        expiresIn: request.data.expires_in,
      };
    } catch (e) {
      throw new Oauth2TokenError(
        'Unable to exchange code for token',
        e.message,
        e.response?.status,
        e.response?.data,
      );
    }
  }

  getLoginUrl(data: GetLoginUrlInput): GetLoginUrlOutput {
    const scopes = data.scopes ?? ['email', 'phone', 'openid', 'profile'];

    const queryParams = {
      client_id: data.clientId,
      response_type: 'code',
      scopes: scopes.join(' '),
      redirect_uri: data.redirectUri,
    };

    const queryString = Object.entries(queryParams)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join('&');

    const url = this.cognitoDomainUrl + '/oauth2/authorize?' + queryString;

    return { url };
  }

  getLogoutUrl(data: GetLogoutUrlInput): GetLogoutUrlOutput {
    const queryParams = {
      client_id: data.clientId,
      logout_uri: data.logoutUri,
    };

    const queryString = Object.entries(queryParams)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join('&');

    const url = this.cognitoDomainUrl + '/logout?' + queryString;

    return { url };
  }

  getSecretHash(clientId: string, clientSecret: string, username: string) {
    const hmac = createHmac('sha256', clientSecret);
    hmac.update(username + clientId);
    return hmac.digest('base64');
  }
}
