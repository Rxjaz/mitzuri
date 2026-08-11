//los 4 parametros son obligatorios: Express identifica los manejadores de
//error por la aridad de la funcion. Con 3 lo trata como middleware normal
//y lo salta, devolviendo el HTML de error por defecto en vez de JSON.
// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  const status = err.statusCode || 500;

  res.status(status).json({
    error: err.message || "Internal Server Error"
  });
};

export default errorMiddleware;