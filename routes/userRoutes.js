const express = require("express");

const userController = require("../controllers/userController.js");
const authController = require("../controllers/authController.js");

const router = express.Router();

// this part is for signup and login
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// this part if for password update
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword", authController.resetPassword);

// all below operations need to be authentified
router.use(authController.setcognitoUser);

// the following middleware can be kept to protect routes
// and allow them for logged in users
// router.use(authController.protect);

//route to refresh the token
router.post("/refreshToken", authController.refreshToken);

router.patch("/updateMyPassword", authController.updatePassword);

// me operations
router.get("/getMe", userController.getMe);
router.patch("/updateMe", userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);

module.exports = router;
