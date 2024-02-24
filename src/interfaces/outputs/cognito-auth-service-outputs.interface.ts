export interface CreateM2mTokenOutput {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface ExchangeCodeForTokenOutput {
  accessToken: string;
  idToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface GetLoginUrlOutput {
  url: string;
}

export interface GetLogoutUrlOutput {
  url: string;
}

export interface CreateTokenOutput {
  expiresIn: number;
  accessToken: string;
  tokenType: string;
}

export interface CreateTokenOutput {
  expiresIn: number;
  idToken: string;
  accessToken: string;
  tokenType: string;
}
