const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");

const userRouter = require("./routes/userRoutes.js");
const AppError = require("./utils/AppError.js");
const globalErrorHandler = require("./controllers/errorController.js");

// this file will be used to add the middlewares
// including mounting the different routes

//creating the express application
const app = express();

// set security http headers
app.use(helmet());

//Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//body parser
// security best practice to limite the size of the body to be parsed
app.use(express.json({ limit: "10kb" }));

// data sanitization against XSS attacks
app.use(xss());

// prevent query parameter pollution\
// useful to put all the query params that can be useful in case of duplication
app.use(
  hpp({
    // whitelist: ["duration"],
  })
);

// rate limiter
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests fromm this Ip, please try again in an hour",
});

// use the previous middleware for the /api route
app.use("/api", limiter);

app.use("/api/v1/users", userRouter); // mounting a router

// adding a handler for all the uncaught routes
app.all("*", (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl}`, 404);
  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
