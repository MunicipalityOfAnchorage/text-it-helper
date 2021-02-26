'use strict';

const logger = require('heroku-logger');
const { parsePhoneNumber } = require('libphonenumber-js');

const textIt  = require('../../services/text-it');
const { allSubscribersGroupId } = require('../../../config/lib/tasks/batches');

module.exports = function createContact() {
  return async (req, res, next) => {
    try {
      const { firstName, lastName, mobile, zip } = req.body;

      const data = await textIt.createContact({
        name: `${firstName} ${lastName}`,
        groups: [allSubscribersGroupId],
        urns: [parsePhoneNumber(mobile, 'US').getURI()],
        fields: {
          first: firstName,
          last: lastName,
          zip_code: zip,
        },
      });

      logger.debug('Created TextIt contact', data);

      return res.send({ data });
    } catch (error) {
      return next(error);
    }
  }
};
