import ValidationError from "../errors/validation.error.js";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return next(new ValidationError("Invalid input"));
  }

  req.body = result.data;

  next();
};