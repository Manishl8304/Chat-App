const AppError = require("./../utils/appError");

const sendErrorDev = (err, res) => {
  console.log(err.name);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    // err,
  });
};

const handleValidationError = (err) => {
  const message = Object.values(err.errors)[0].message;
  return new AppError(message, 400);
};
const handleCastError = (err) => {
  const message = `invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};
exports.errorHandler = (err, req, res, next) => {
  if (err.name == "ValidationError") err = handleValidationError(err);
  if (err.name == "CastError") err = handleCastError(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "undefined error";
  sendErrorDev(err, res);
};
