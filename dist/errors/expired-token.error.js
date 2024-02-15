"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpiredTokenError = void 0;
class ExpiredTokenError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.ExpiredTokenError = ExpiredTokenError;
