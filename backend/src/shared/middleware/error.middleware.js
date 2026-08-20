import multer from "multer";
import ValidationError from "../errors/validation.error.js";

//multer lanza MulterError, que no trae `statusCode`; sin traducirlo un archivo
//demasiado grande saldria como 500 cuando en realidad es culpa del cliente
const translateMulterError = (err) => {
  if (!(err instanceof multer.MulterError)) {
    return err;
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return new ValidationError("File is too large. Maximum size is 10 MB");
  }

  return new ValidationError(`Upload failed: ${err.message}`);
};

//los 4 parametros son obligatorios: Express identifica los manejadores de
//error por la aridad de la funcion. Con 3 lo trata como middleware normal
//y lo salta, devolviendo el HTML de error por defecto en vez de JSON.
// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  const error = translateMulterError(err);
  const status = error.statusCode || 500;

  res.status(status).json({
    error: error.message || "Internal Server Error"
  });
};

export default errorMiddleware;
