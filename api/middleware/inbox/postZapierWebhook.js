'use strict';

const logger = require('heroku-logger');
const superagent = require('superagent');

const zapier = require('../../services/zapier');

module.exports = function postZapierWebhook() {
  return async (req, res, next) => {
    try {
      if (zapier.isDisabled()) {
        logger.debug('Zapier disabled');

        return next();
      }

      const zapierRes = await zapier.postWebhook(req.data);

      logger.debug('Zapier response', zapierRes.body);

      return next();
    } catch (error) {
      return next(error);
    }
  }
};
