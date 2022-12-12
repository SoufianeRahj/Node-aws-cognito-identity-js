const AppError = require("../utils/AppError");
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");

exports.updateMe = (req, res, next) => {
  const { attributeList } = req.body;
  let cognitoAttributeList = attributeList.map(
    (att) => new AmazonCognitoIdentity.CognitoUserAttribute(att)
  );

  const cognitoUser = req.cognitoUser;
  cognitoUser.updateAttributes(cognitoAttributeList, function (err, result) {
    if (err) {
      console.error(err.message);
      return next(new AppError(err.message, 500));
    }
    res.status(200).json({
      status: "success",
      data: result,
    });
  });
};

exports.deleteMe = (req, res, next) => {
  const cognitoUser = req.cognitoUser;

  cognitoUser.deleteUser(function (err, result) {
    if (err) {
      console.error(err.message);
      return next(new AppError(err.message, 500));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
};

exports.getMe = (req, res, next) => {
  const cognitoUser = req.cognitoUser;

  cognitoUser.getUserAttributes(function (err, result) {
    if (err) {
      console.error(err.message);
      return next(new AppError(err.message, 500));
    }
    res.status(200).json({
      status: "success",
      data: result,
    });
  });
};
