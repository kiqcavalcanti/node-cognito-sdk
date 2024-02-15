import { CacheServiceInterface, CreateM2mTokenOutput, ExchangeCodeForTokenOutput, GetLoginUrlOutput, GetLogoutUrlOutput } from '../interfaces';
import { AwsCredentials, CognitoBaseService } from './cognito-base.service';
import { AdminInitiateAuthInput, CreateM2MTokenInput, ExchangeCodeForTokenInput, GetLoginUrlInput, GetLogoutUrlInput, GlobalLogoutInput, TokenInfoInput } from '../interfaces/inputs/cognito-auth-service-inputs.interfaces';
import { TokenValidationService } from './token-validation.service';
import { CognitoUserService } from './cognito-user.service';
export declare class CognitoAuthService extends CognitoBaseService {
    protected cognitoDomainUrl: string;
    protected cognitoIdpUrl: string;
    protected cacheService: CacheServiceInterface;
    protected readonly tokenValidationService: TokenValidationService;
    protected readonly cognitoUserService: CognitoUserService;
    constructor(userPoolId: string, region: string, credentials: AwsCredentials, cognitoDomainUrl: string, cognitoIdpUrl: string, cacheService?: CacheServiceInterface);
    createM2MToken(data: CreateM2MTokenInput): Promise<CreateM2mTokenOutput>;
    tokenInfo(data: TokenInfoInput): Promise<import("../interfaces").TokenInfoOutput>;
    globalLogout(data: GlobalLogoutInput): Promise<boolean>;
    adminInitiateAuth(data: AdminInitiateAuthInput): Promise<any>;
    exchangeCodeForToken(data: ExchangeCodeForTokenInput): Promise<ExchangeCodeForTokenOutput>;
    getLoginUrl(data: GetLoginUrlInput): GetLoginUrlOutput;
    getLogoutUrl(data: GetLogoutUrlInput): GetLogoutUrlOutput;
    getSecretHash(clientId: string, clientSecret: string, username: string): string;
}
