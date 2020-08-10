'use strict';

const auth = require('basic-auth');
const logger = require('heroku-logger');

const config = require('../../config/middleware/authenticate');

/**
 * @param {Object} user
 * @return {Boolean}
 */
function validateBasicAuth(user) {
  return (user.name === config.auth.name &&
    user.pass === config.auth.pass);
}

module.exports = function authenticate() {
  return (req, res, next) => {
    const user = auth(req) || {};

    if (validateBasicAuth(user)) {
      return next();
    }

    res.setHeader('WWW-Authenticate', 'Basic');

    return res.status(config.unauthorizedErrorCode).send({
      message: config.unauthorizedErrorMessage,
    });
  };
};
