'use strict';

const logger = require('heroku-logger');

const textIt = require('../../services/text-it');

module.exports = function getContact() {
  return async (req, res, next) => {
    try {
      const textItRes = await textIt.getContactById(req.contactId);

      logger.debug('TextIt response', textItRes);

      const { fields, groups, name, blocked, stopped, created_on, modified_on } = textItRes;

       req.data = {
        uuid: req.contactId,
        name,
        phone: req.phone,
        blocked,
        stopped,
        created_on,
        modified_on,
        url: textIt.getUrlForContactId(req.contactId),
        message: {
          flow_name: req.flow.name,
          text: req.results.result.value,
        },
        fields,
        groups,
      };
  
      return next();
    } catch (error) {
      return next(error);
    }
  }
};
