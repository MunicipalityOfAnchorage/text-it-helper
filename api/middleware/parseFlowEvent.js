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

      const textItRes = await textIt.getContactById(uuid);
      logger.debug('TextIt response', textItRes);

      if (!textItRes) {
        req.data = {
          uuid,
          flow,
          results,
        };

        return next();
      }

      const { fields, groups, name, blocked, stopped, created_on, modified_on } = textItRes;

      req.data = {
        uuid,
        flow,
        results,
        phone: contact.urn.substring(5),
        name,
        // Removes +tel prefix.
        url: textIt.getUrlForContactId(uuid),
        blocked,
        stopped,
        created_on,
        modified_on,
        fields,
        groups: groups.map(group => group.name).join(', '),
        // TODO: Add a 'html' property here to return entire payload as a <dl>.
      };

      return next();
    } catch (error) {
      return next(error);
    }
  }
};
