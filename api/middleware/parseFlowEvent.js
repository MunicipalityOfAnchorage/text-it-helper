'use strict';

const logger = require('heroku-logger');

const textIt = require('../services/text-it');

module.exports = function parseFlowEvent() {
  return async (req, res, next) => {
    try {
      const { body } = req;

      logger.debug('Received TextIt flow event', { body });

      const { contact, flow, results } = req.body;
      const { uuid } = contact;
      const timestamp = Date.now();

      const textItRes = await textIt.getContactById(uuid);

      logger.debug('TextIt response', textItRes);

      if (!textItRes) {
        req.data = {
          uuid,
          timestamp,
          flow,
          results,
        };

        return next();
      }

      const { fields, groups, name, blocked, stopped, created_on, modified_on } = textItRes;

      req.data = {
        uuid,
        timestamp,
        // Removes +tel prefix.
        phone: contact.urn.substring(5),
        name,
        url: textIt.getUrlForContactId(uuid),
        blocked,
        stopped,
        created_on,
        modified_on,
        fields,
        groups: groups.map(group => group.name).join(', '),
        flow,
        results,
      };

      return next();
    } catch (error) {
      return next(error);
    }
  }
};
