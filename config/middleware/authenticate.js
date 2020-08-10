'use strict';

module.exports = {
  auth: {
    name: process.env.BASIC_AUTH_NAME,
    pass: process.env.BASIC_AUTH_PASS,
  },
  unauthorizedErrorMessage: 'Invalid or missing auth parameters. Unauthorized.',
  unauthorizedErrorCode: 401,
};
