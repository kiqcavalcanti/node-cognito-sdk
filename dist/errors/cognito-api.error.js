"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitoApiError = void 0;
class CognitoApiError extends Error {
    constructor(message, errorMessage, status) {
        super(message);
        this.errorMessage = errorMessage;
        this.status = status;
    }
}
exports.CognitoApiError = CognitoApiError;
