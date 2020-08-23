'use strict';

const { assign } = require('lodash');
const logger = require('heroku-logger');
const superagent = require('superagent');

const zapier = require('../services/zapier');

module.exports = function postWebhook() {
  return async (req, res, next) => {
    try {
      if (!req.query.zapier) {
        logger.debug('Skipping send to Zapier');

        return next();
      }

      const zapierParams = req.query.zapier.split('-');

      const zapierRes = await zapier.postWebhook(zapierParams[0], zapierParams[1], req.data);

      req.responses['zapier'] = zapierRes.body;

      logger.debug('Zapier response', zapierRes.body);

      return next();
    } catch (error) {
      return next(error);
    }
  }
};
