import {
  CognitoIdentityProviderClient,
  CognitoIdentityProviderClientConfig,
} from '@aws-sdk/client-cognito-identity-provider';

export type AwsCredentials = { accessKeyId: string; secretAccessKey: string };

export abstract class CognitoBaseService {
  protected cognitoClient;
  constructor(
    protected userPoolId: string,
    protected region: string,
    protected credentials: AwsCredentials,
  ) {
    const config: CognitoIdentityProviderClientConfig = {
      region: region,
      credentials: credentials,
    };

    this.cognitoClient = new CognitoIdentityProviderClient(config);
  }
}
