"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Oauth2TokenError = void 0;
class Oauth2TokenError extends Error {
    constructor(message, errorMessage, status, data = null) {
        super(message);
        this.errorMessage = errorMessage;
        this.status = status;
        this.data = data;
    }
}
exports.Oauth2TokenError = Oauth2TokenError;
