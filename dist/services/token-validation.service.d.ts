import { CacheServiceInterface, TokenInfoOutput } from '../interfaces';
export declare class TokenValidationService {
    protected cognitoIdpUrl: string;
    protected userPoolId: string;
    protected cacheService: CacheServiceInterface;
    constructor(cognitoIdpUrl: string, userPoolId: string, cacheService?: CacheServiceInterface);
    validateToken(token: string): Promise<TokenInfoOutput>;
    private verifyToken;
    protected getKeys(): Promise<any>;
}
