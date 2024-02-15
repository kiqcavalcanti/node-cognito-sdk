export declare class Oauth2TokenError extends Error {
    errorMessage: string;
    status: number;
    data: any;
    constructor(message: string, errorMessage: string, status: number, data?: any);
}
