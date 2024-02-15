"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidTokenError = void 0;
class InvalidTokenError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.InvalidTokenError = InvalidTokenError;
