const errorMiddleware = (err, req, res, next) => {
  const status = err.statusCode || 500;

  res.status(status).json({
    error: err.message || "Internal Server Error"
  });
};

export default errorMiddleware;