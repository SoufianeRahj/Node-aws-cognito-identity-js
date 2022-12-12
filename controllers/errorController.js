// const AppError = require("./../utils/AppError.js");

// const handleSpecificError = (err) => {
//   const message = `Invalid ${err.path}: ${err.value}`;
//   return new AppError(message, 400);
// };

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // only operational trusted errors are send to the client in prod
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // programing & unknown errors are not sent as is to client
    // to prevent leaking error details
    console.error("ERROR: ", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err }; // shallow copy
    // if (some condition on the error, its name or code for instance) {
    //   error = handleSpecificError(error);
    // }
    sendErrorProd(error, res);
  }
};
