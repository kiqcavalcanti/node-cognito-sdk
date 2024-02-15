export interface TokenInfoOutput {
    sub: string;
    deviceKey: string;
    iss: string;
    clientId: string;
    originJti: string;
    eventId: string;
    tokenUse: string;
    scope: string;
    authTime: number;
    exp: number;
    iat: number;
    jti: string;
    name: string;
    email: string;
    picture: string;
    birthDate: string;
    phoneNumber: string;
    phoneNumberVerified: boolean;
    emailVerified: boolean;
    groups: string[];
    username: string;
}
export interface DecodedPayloadToken {
    sub: string;
    device_key?: string;
    iss?: string;
    client_id?: string;
    origin_jti?: string;
    event_id?: string;
    token_use?: string;
    scope?: string;
    auth_time?: number;
    exp?: number;
    iat?: number;
    jti?: string;
    name?: string;
    email?: string;
    picture?: string;
    birthdate?: string;
    phone_number?: string;
    phone_number_verified?: boolean;
    email_verified?: boolean;
    'cognito:groups'?: string[];
    username?: string;
    'cognito:username'?: string;
}
