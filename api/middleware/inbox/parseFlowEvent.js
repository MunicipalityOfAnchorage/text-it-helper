'use strict';

const logger = require('heroku-logger');

module.exports = function parseFlowEvent() {
  return async (req, res, next) => {
    try {
      const { body } = req;

      logger.debug('Received TextIt flow event', { body });

      const { contact, flow, results } = req.body;

      req.contactId = contact.uuid;
      req.phone = contact.urn.substring(5),
      req.flow = flow;
      req.results = results;

      return next();
    } catch (error) {
      return next(error);
    }
  }
};
