import AppError from "./app.error.js";

class InternalError extends AppError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
    this.name = "InternalError";
  }
}

export default InternalError;