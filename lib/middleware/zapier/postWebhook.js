'use strict';

const { assign } = require('lodash');
const logger = require('heroku-logger');
const superagent = require('superagent');

const zapier = require('../../services/zapier');

module.exports = function postWebhook() {
  return async (req, res, next) => {
    try {
      req.data = {
        'Contact': req.contact,
        'Flow': assign(req.flow, req.results),
      };

      //assign(req.data.flow, req.results);

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
