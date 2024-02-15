import { AwsCredentials, CognitoBaseService } from './cognito-base.service';
export declare class CognitoUserService extends CognitoBaseService {
    protected apiUrl: string;
    constructor(userPoolId: string, region: string, credentials: AwsCredentials, apiUrl: string);
    getUserInfoByToken(token: string): Promise<any>;
    adminGetUserInfo(username: string): Promise<any>;
    createUser(data: {
        username: string;
        password: string;
        email: string;
        name: string;
        picture: string;
        phoneNumber: string;
        birthDate: string;
    }): Promise<any>;
    adminDefineUserPassword(data: {
        username: string;
        password: string;
        permanent: boolean;
    }): Promise<void>;
    changeUserPassword(data: {
        previousPassword: string;
        newPassword: string;
        accessToken: string;
    }): Promise<void>;
    protected getUserAttributes(data: {
        email: string;
        picture: string;
        phoneNumber: string;
        birthDate: string;
    }): {
        Name: string;
        Value: string;
    }[];
    updateUserAttributes(data: {
        username: string;
        email: string;
        name: string;
        picture: string;
        phoneNumber: string;
        birthDate: string;
    }): Promise<any>;
    adminDeleteUser(data: {
        username: string;
    }): Promise<any>;
    adminListUsers(dto: {
        perPage: number;
        nextPage: string;
        search: string;
    }): Promise<any>;
}
