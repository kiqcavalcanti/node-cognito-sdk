"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenValidationService = void 0;
const errors_1 = require("../errors");
const jwt = require("jsonwebtoken");
const jwk_to_pem_1 = require("jwk-to-pem");
const jsonwebtoken_1 = require("jsonwebtoken");
class TokenValidationService {
    constructor(cognitoIdpUrl, userPoolId, cacheService = null) {
        this.cognitoIdpUrl = cognitoIdpUrl;
        this.userPoolId = userPoolId;
        this.cacheService = cacheService;
    }
    async validateToken(token) {
        const decodedToken = jwt.decode(token, { complete: true });
        const payload = decodedToken.payload;
        if (!decodedToken) {
            throw new errors_1.InvalidTokenError('Invalid token');
        }
        if (!payload.iss) {
            throw new errors_1.InvalidTokenError('Invalid token');
        }
        const jwks = await this.getKeys();
        const { header } = decodedToken;
        const key = jwks.keys.find((jwk) => jwk.kid === header.kid);
        if (!key) {
            throw new errors_1.InvalidTokenError('Invalid token');
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
            phoneNumberVerified: typeof payload.phone_number_verified === 'boolean'
                ? payload.phone_number_verified
                : false,
            emailVerified: typeof payload.email_verified === 'boolean'
                ? payload.email_verified
                : false,
            groups: payload['cognito:groups'] ?? [],
            username: username,
        };
    }
    verifyToken(token, key) {
        try {
            const pem = (0, jwk_to_pem_1.default)(key);
            jwt.verify(token, pem, {
                algorithms: ['RS256'],
            });
        }
        catch (e) {
            if (e instanceof jsonwebtoken_1.TokenExpiredError) {
                throw new errors_1.ExpiredTokenError('Expired Token');
            }
            else {
                throw new errors_1.InvalidTokenError('Invalid Token');
            }
        }
    }
    async getKeys() {
        if (this.cacheService) {
            const jwksCache = await this.cacheService.get('COMERC_AUTH.JWKS');
            if (jwksCache) {
                return JSON.parse(jwksCache);
            }
        }
        const url = this.cognitoIdpUrl + '/' + this.userPoolId + '/.well-known/jwks.json';
        const response = await fetch(url);
        const jwks = await response.json();
        if (!jwks) {
            throw new errors_1.InvalidTokenError('Unable to obtain public keys');
        }
        if (this.cacheService) {
            await this.cacheService.set('COMERC_AUTH.JWKS', JSON.stringify(jwks), 24 * 60 * 60 * 1000);
        }
        return jwks;
    }
}
exports.TokenValidationService = TokenValidationService;
