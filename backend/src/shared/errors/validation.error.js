import AppError from "./app.error.js";

class ValidationError extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400);
    this.name = "ValidationError";
  }
}

export default ValidationError;