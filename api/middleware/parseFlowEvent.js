'use strict';

const logger = require('heroku-logger');

const textIt = require('../services/text-it');

module.exports = function parseFlowEvent() {
  return async (req, res, next) => {
    try {
      const { body } = req;

      logger.debug('Received TextIt flow event', { body });

      const { contact, flow, results } = req.body;

      const contactId = contact.uuid;

      contact.url = textIt.getUrlForContactId(contactId);
      // Removes +tel prefix
      contact.phone = contact.urn.substring(5);

      const textItRes = await textIt.getContactById(contactId);

      logger.debug('TextIt response', textItRes);

      const { fields, groups, name, blocked, stopped, created_on, modified_on } = textItRes;

      req.data = {
        contact,
        flow,
        results,
        fields,
        groups: groups.map(group => group.name).join(', '),
      };

      return next();
    } catch (error) {
      return next(error);
    }
  }
};
