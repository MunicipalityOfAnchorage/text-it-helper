'use strict';

const logger = require('heroku-logger');
const superagent = require('superagent');

const zapier = require('../../../lib/zapier');

module.exports = function postZapierWebhook() {
  return async (req, res, next) => {
    try {
      if (req.query.test) {
        logger.debug('Skipping send to Zapier');

        return next();
      }

      const { id1, id2 } = req.params;

      const zapierRes = await zapier.postWebhook({ id1, id2, data: req.data });

      logger.debug('Zapier response', zapierRes.body);

      return next();
    } catch (error) {
      return next(error);
    }
  }
};
