'use strict';

const logger = require('heroku-logger');
const { parsePhoneNumber } = require('libphonenumber-js');

const textIt  = require('../services/text-it');

module.exports = function createFlowStart() {
  return async (req, res, next) => {
    try {
      const {
        firstName,
        flowId,
        lastName,
        mobile,
        zip,
      } = req.body;
      const urn = parsePhoneNumber(mobile, 'US').getURI();

      let contact = await textIt.getContactByUrn(urn);

      if (!contact) {
        contact = await textIt.createContact({
          name: `${firstName} ${lastName}`,
          urns: [urn],
          fields: {
            first: firstName,
            last: lastName,
            zip_code: zip,
          },
        });
        logger.debug('Created TextIt contact', contact);
      } else {
        logger.debug('Found TextIt contact', contact);
      }

      const { uuid } = contact;

      const data = await textIt.createFlowStart(flowId, uuid);

      return res.send(data);
    } catch (error) {
      return next(error);
    }
  }
};
