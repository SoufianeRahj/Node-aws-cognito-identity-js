const AmazonCognitoIdentity = require("amazon-cognito-identity-js");
const CognitoExpress = require("cognito-express");

const AppError = require("../utils/AppError");

const poolData = {
  UserPoolId: process.env.USER_POOL_ID,
  ClientId: process.env.CLIENT_ID,
};

const cognitoExpress = new CognitoExpress({
  region: process.env.REGION,
  cognitoUserPoolId: process.env.USER_POOL_ID,
  tokenUse: "id",
  tokenExpiration: 3600000,
});

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

exports.signup = (req, res, next) => {
  const { email, password } = req.body;
  // Creating the attributes to store in the group of users
  const attributeList = [];
  const dataEmail = {
    Name: "email",
    Value: email,
  };
  const attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(
    dataEmail
  );
  attributeList.push(attributeEmail);

  // signup the user
  userPool.signUp(email, password, attributeList, null, function (err, result) {
    if (err) {
      console.log(err.message);
      return next(new AppError(err.message, 400));
    }
    const cognitoUser = result.user;
    res.status(200).json({
      status: "success",
      data: {
        user: cognitoUser,
      },
    });
  });
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;

  const authenticationData = {
    Username: email,
    Password: password,
  };
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    authenticationData
  );

  const userData = {
    Username: email,
    Pool: userPool,
  };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      console.log(result.getAccessToken().getJwtToken());
      res.status(200).json({
        status: "success",
        data: result.idToken.payload,
        session: cognitoUser.signInUserSession,
      });
    },
    onFailure: function (err) {
      console.error(err.message);
      return next(new AppError(err.message, 401));
    },
  });
};

exports.protect = (req, res, next) => {
  // Extract token from the authorization header
  let token;
  // check for the bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in", 401));
  }

  // validate token
  cognitoExpress.validate(token, function (err, response) {
    if (err) {
      return next(new AppError(err.message, 401));
    }
    const email = response.email;
    req.email = email;
    next();
  });
};

exports.setcognitoUser = (req, res, next) => {
  // check if the session is present
  const { session } = req.body;
  const email = session.idToken.payload.email;

  if (!session) {
    return next(new AppError("You are not logged in", 401));
  }

  // the Id token is valid at this point

  const userData = {
    Username: email,
    Pool: userPool,
  };
  let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  const idToken = new AmazonCognitoIdentity.CognitoIdToken({
    IdToken: session.idToken.jwtToken,
  });
  const accessToken = new AmazonCognitoIdentity.CognitoAccessToken({
    AccessToken: session.accessToken.jwtToken,
  });
  const refreshToken = new AmazonCognitoIdentity.CognitoRefreshToken({
    RefreshToken: session.refreshToken.token,
  });

  const sessionData = {
    IdToken: idToken,
    AccessToken: accessToken,
    RefreshToken: refreshToken,
  };

  const cognitoUserSession = new AmazonCognitoIdentity.CognitoUserSession(
    sessionData
  );

  cognitoUser.setSignInUserSession(cognitoUserSession);
  req.cognitoUser = cognitoUser;
  next();
};

exports.refreshToken = (req, res, next) => {
  const cognitoUser = req.cognitoUser;

  const refresh_token = cognitoUser.getSignInUserSession().getRefreshToken();
  cognitoUser.refreshSession(refresh_token, (err, session) => {
    if (err) return next(new AppError(err.message));
    res.status(200).json({
      status: "success",
      session,
    });
  });
};

exports.forgotPassword = (req, res, next) => {
  const { email } = req.body;

  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  const userData = {
    Username: email,
    Pool: userPool,
  };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.forgotPassword({
    onSuccess: function (data) {
      console.log("Code sent to reset the password");
      res.status(200).json({
        status: "success",
        data,
      });
    },
    onFailure: function (err) {
      console.error(err.message);
      return next(new AppError(err.message, 500));
    },
  });
};

exports.resetPassword = (req, res, next) => {
  const { verificationCode, email, newPassword } = req.body;

  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  const userData = {
    Username: email,
    Pool: userPool,
  };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.confirmPassword(verificationCode, newPassword, {
    onSuccess() {
      console.log("Password confirmed!");
      res.status(200).json({
        status: "success",
        data: "Password confirmed",
      });
    },
    onFailure(err) {
      console.error("Password not confirmed!");
      return next(new AppError(err.message, 400));
    },
  });
};

exports.updatePassword = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const cognitoUser = req.cognitoUser;

  cognitoUser.changePassword(oldPassword, newPassword, function (err, result) {
    if (err) {
      console.error(err.message);
      return next(new AppError(err.message, 500));
    }
    console.log("Password succesfully changed");
    res.status(200).json({
      status: "success",
      data: "Password succesfully changed",
      result,
    });
  });
};
