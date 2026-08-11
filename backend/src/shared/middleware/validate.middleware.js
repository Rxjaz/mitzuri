import ValidationError from "../errors/validation.error.js";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    //en Zod 4 la lista de problemas es `issues`; `errors` ya no existe
    const firstError = result.error.issues[0];
    return next(new ValidationError(firstError.message));
  }

  req.body = result.data;

  next();
};