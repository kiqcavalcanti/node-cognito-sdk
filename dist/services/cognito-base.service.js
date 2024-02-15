"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitoBaseService = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
class CognitoBaseService {
    constructor(userPoolId, region, credentials) {
        this.userPoolId = userPoolId;
        this.region = region;
        this.credentials = credentials;
        const config = {
            region: region,
            credentials: credentials,
        };
        this.cognitoClient = new client_cognito_identity_provider_1.CognitoIdentityProviderClient(config);
    }
}
exports.CognitoBaseService = CognitoBaseService;
