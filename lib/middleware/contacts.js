'use strict';

const logger = require('heroku-logger');

module.exports = function contacts() {
  return async (req, res, next) => {
    try {
      const data = req.body;

      logger.debug('Payload', data);

      return res.send({ data });
    } catch (error) {
      return next(error);
    }
  }
};
