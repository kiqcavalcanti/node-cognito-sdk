export class Oauth2TokenError extends Error {
  constructor(
    message: string,
    public errorMessage: string,
    public status: number,
    public data: any = null,
  ) {
    super(message);
  }
}
