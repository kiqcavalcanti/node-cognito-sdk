export interface GetUserInfoOutput {
  id: string;
  username: string;
  name: string;
  email?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
  birthDate?: string;
  picture?: string;
}

export interface GetUserInfoOutputPaginate {
  items: GetUserInfoOutput[];
  meta: {
    nextPage: string;
  };
}
