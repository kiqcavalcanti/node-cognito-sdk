export type AwsCredentials = {
    accessKeyId: string;
    secretAccessKey: string;
};
export declare abstract class CognitoBaseService {
    protected userPoolId: string;
    protected region: string;
    protected credentials: AwsCredentials;
    protected cognitoClient: any;
    constructor(userPoolId: string, region: string, credentials: AwsCredentials);
}
