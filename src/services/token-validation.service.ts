import {
  CacheServiceInterface,
  DecodedPayloadToken,
  TokenInfoOutput,
} from '../interfaces';
import { ExpiredTokenError, InvalidTokenError } from '../errors';
import * as jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import { TokenExpiredError } from 'jsonwebtoken';

export class TokenValidationService {
  constructor(
    protected cognitoIdpUrl: string,
    protected userPoolId: string,
    protected cacheService: CacheServiceInterface = null,
  ) {}
  public async validateToken(token: string): Promise<TokenInfoOutput> {
    const decodedToken = jwt.decode(token, { complete: true });

    const payload = decodedToken.payload as DecodedPayloadToken;

    if (!decodedToken) {
      throw new InvalidTokenError('Invalid token');
    }

    if (!payload.iss) {
      throw new InvalidTokenError('Invalid token');
    }

    const jwks = await this.getKeys();

    const { header } = decodedToken;
    const key = jwks.keys.find((jwk) => jwk.kid === header.kid);

    if (!key) {
      throw new InvalidTokenError('Invalid token');
    }

    this.verifyToken(token, key);

    const username = payload.username ?? payload['cognito:username'] ?? '';

    return {
      sub: payload.sub,
      deviceKey: payload.device_key ?? '',
      iss: payload.iss ?? '',
      clientId: payload.client_id ?? '',
      originJti: payload.origin_jti ?? '',
      eventId: payload.event_id ?? '',
      tokenUse: payload.token_use ?? '',
      scope: payload.scope ?? '',
      authTime: payload.auth_time ?? 0,
      exp: payload.exp ?? 0,
      iat: payload.iat ?? 0,
      jti: payload.jti ?? '',
      name: payload.name ?? '',
      email: payload.email ?? '',
      picture: payload.picture ?? '',
      birthDate: payload.birthdate ?? '',
      phoneNumber: payload.phone_number ?? '',
      phoneNumberVerified:
        typeof payload.phone_number_verified === 'boolean'
          ? payload.phone_number_verified
          : false,
      emailVerified:
        typeof payload.email_verified === 'boolean'
          ? payload.email_verified
          : false,
      groups: payload['cognito:groups'] ?? [],
      username: username,
    };
  }

  private verifyToken(token: string, key: any): void {
    try {
      const pem = jwkToPem(key);

      jwt.verify(token, pem, {
        algorithms: ['RS256'],
      });
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new ExpiredTokenError('Expired Token');
      } else {
        throw new InvalidTokenError('Invalid Token');
      }
    }
  }

  protected async getKeys(): Promise<any> {
    if (this.cacheService) {
      const jwksCache = await this.cacheService.get('COMERC_AUTH.JWKS');

      if (jwksCache) {
        return typeof jwksCache === 'string'
          ? JSON.parse(jwksCache)
          : jwksCache;
      }
    }

    const url =
      this.cognitoIdpUrl + '/' + this.userPoolId + '/.well-known/jwks.json';

    const response = await fetch(url);

    const jwks = await response.json();

    if (!jwks) {
      throw new InvalidTokenError('Unable to obtain public keys');
    }

    if (this.cacheService) {
      await this.cacheService.set(
        'COMERC_AUTH.JWKS',
        typeof jwks === 'string' ? jwks : JSON.stringify(jwks),
        24 * 60 * 60 * 1000,
      );
    }

    return jwks;
  }
}
