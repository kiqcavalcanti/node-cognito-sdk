export interface AdminCreateUserInput {
  name: string;
  username: string;
  email: string;
  password?: boolean | undefined;
  passwordTemporary?: boolean | undefined;
  birthDate?: string | undefined;
  phoneNumber?: string | undefined;
  picture?: string | undefined;
}

export interface AdminUpdateUserInput {
  username: string;
  name?: string | undefined;
  email?: string | undefined;
  password?: boolean | undefined;
  passwordTemporary?: boolean | undefined;
  birthDate?: string | undefined;
  phoneNumber?: string | undefined;
  picture?: string | undefined;
}

export interface AdminChangePasswordInput {
  username: string;
  password: string;
  passwordTemporary?: boolean | undefined;
}
