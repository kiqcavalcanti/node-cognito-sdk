"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevokedTokenError = void 0;
class RevokedTokenError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.RevokedTokenError = RevokedTokenError;
