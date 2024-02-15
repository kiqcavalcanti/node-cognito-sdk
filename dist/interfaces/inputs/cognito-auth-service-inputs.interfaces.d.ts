export interface GlobalLogoutInput {
    token: string;
}
export interface TokenInfoInput {
    token: string;
    verifyRevoked: boolean;
}
export interface CreateM2MTokenInput {
    clientId: string;
    clientSecret: string;
    scopes: string[];
}
export interface AdminInitiateAuthInput {
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
}
export interface ExchangeCodeForTokenInput {
    clientId: string;
    clientSecret?: string;
    code: string;
    redirectUri: string;
}
export interface GetLoginUrlInput {
    clientId: string;
    redirectUri: string;
    scopes?: string[];
}
export interface GetLogoutUrlInput {
    clientId: string;
    logoutUri: string;
}
