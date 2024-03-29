This is a Node/Express application that uses AWS Cognito User Pool as a user directory

The interaction with Cognito is achieved using the amazon-cognito-identity-js library. 

The following endpoints are exposed by the express app for unauthenticated users: 

- POST host/signup: signup using email and password data
- POST host/login: login using email and password
- POST host/forgotPassword: this action sends an email with a verification code
- PATCH host/resetPassword: reset a password based on a verification code

The following endpoints are exposed for authenticated users:

- PATCH /updateMyPassword: to update the password
- GET /getMe: to retrieve the logged in user attributes in the Cognito User Pool
- PATCH /updateMe: to update the attributes of the logged in user
- DELETE /deleteMe: to delete the logged in user

The following middlewares are also defined: 
- protect: to verify the id token based on the cognito-express library
- refreshToken: to refresh the token of the authenticated user

Usecase for the application:
- Adding a Backend Layer for all interactions with Cognito User pool (user directory) instead of making all calls directly from the frontend web/mobile that uses the AWS SDK.
