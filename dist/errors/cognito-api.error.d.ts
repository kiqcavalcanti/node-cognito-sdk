export declare class CognitoApiError extends Error {
    errorMessage: string;
    status: number;
    constructor(message: string, errorMessage: string, status: number);
}
