'use strict';

const { assign } = require('lodash');
const logger = require('heroku-logger');

const { getPlainTextFromReq } = require('../formatters');

module.exports = function sendResponse() {
  return (req, res, next) => {
    try {
      const data = req.data;

      logger.debug('Sending data', { data });

      return res.send({
        data,
        text: getPlainTextFromReq(req),
      });
    } catch (error) {
      return next(error);
    }
  };
};
