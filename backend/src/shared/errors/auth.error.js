import AppError from "./app.error.js";

class AuthError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
    this.name = "AuthError";
  }
}

export default AuthError;