'use strict';

const { assign } = require('lodash');
const logger = require('heroku-logger');

const formatters = require('../formatters');
const textIt = require('../services/text-it');

module.exports = function parseFlowEvent() {
  return async (req, res, next) => {
    try {
      const { body } = req;

      logger.debug('Received TextIt flow event', { body });

      const { contact, flow, results } = body;
      const { uuid } = contact;

      req.contact = contact;
      req.flow = formatters.formatObjectKeys(flow);
      req.results = formatters.formatTextItResults(results);

      const textItRes = await textIt.getContactById(uuid);

      logger.debug('TextIt response', textItRes);

      if (textItRes) {
        req.contact = textItRes;
      }

      req.contact = formatters.formatTextItContact(req.contact);

      return next();
    } catch (error) {
      return next(error);
    }
  }
};
