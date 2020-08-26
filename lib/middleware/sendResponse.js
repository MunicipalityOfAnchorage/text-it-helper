'use strict';

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
        responses: req.responses,
      });
    } catch (error) {
      return next(error);
    }
  };
};
