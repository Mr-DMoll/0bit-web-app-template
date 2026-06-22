export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly email?: string; // Explicitly defined here

  constructor(message: string, statusCode: number, email?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.email = email; // Assigned directly

    Error.captureStackTrace(this, this.constructor);
  }
}
