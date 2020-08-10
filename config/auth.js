'use strict';

module.exports = {
  apiKey: process.env.AUTH_API_KEY,
  unauthorizedErrorMessage: 'Invalid or missing auth parameters. Unauthorized.',
  unauthorizedErrorCode: 401,
};
