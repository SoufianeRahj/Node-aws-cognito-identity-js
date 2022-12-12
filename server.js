//SAFETY NET | HANDLING uncaught EXCEPTIONS in sync code
process.on("uncaughtException", (err) => {
  console.error(err.name, err.message);
  console.log("Unhandled Exception, Shutting down");
  process.exit(1);
});

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const app = require("./app.js");

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

//SAFETY NET | HANDLING unhandled PROMISE REJECTIONS in async code
process.on("unhandledRejection", (err) => {
  console.error(err.name, err.message);
  console.log("Unhandled rejection, Shutting down");
  server.close(() => {
    process.exit(1);
  });
});
