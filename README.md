# Node-Express-starterPack
Basic Express application on Node with error handling middleware and utility class

This application includes squeleton for CRUD operation on a resource and its subresource.
The data is not persisted anyware, the route handlers only returns an empty response with the right status code (depending on the http verb).
This squeleton also includes a global error handling middleware and an Error utility class.

The logging in the application is done via morgan in dev environment only for the moment.

The security of the application is managed through the following libs: 
- helmet: security http headers
- hpp: prevent query parameter pollution
- xss-clean: data sanitization against xss attacks
- express-rate-limit: for rate limiting directly on the express application

To run the application, first install all the dependencies throught: 
- npm intall

then run the start script:
- npm run start
