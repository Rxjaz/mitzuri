import ValidationError from "../errors/validation.error.js";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const firstError = result.error.errors[0];
    return next(new ValidationError(firstError.message));
  }

  req.body = result.data;

  next();
};