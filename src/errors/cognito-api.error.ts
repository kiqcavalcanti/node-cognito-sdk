export class CognitoApiError extends Error {
  constructor(
    message: string,
    public errorMessage: string,
    public status: number,
  ) {
    super(message);
  }
}
