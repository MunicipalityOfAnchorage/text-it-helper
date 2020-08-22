'use strict';

const { startCase } = require('lodash');
const logger = require('heroku-logger');
const superagent = require('superagent');

const airtable = require('../../services/airtable');

module.exports = function createRecord() {
  return async (req, res, next) => {
    try {
      const contactsTableName = 'Contacts';
      const tableName = startCase(req.query.table);

      if (!tableName) {
        return res.status(422).send('Missing table query parameter');
      }

      const { fields, name, results, uuid, url } = req.data;

      let contactRecord = await airtable.getRecordByUuid(contactsTableName, uuid);

      logger.debug('Found Airtable contact', contactRecord);

      if (!contactRecord) {
        const createContactPayload = {
          'Name': name,
          'Profile': url,
          'Uuid': uuid,
        };

        /**
         * TODO: Remove extraneous fields from Small Biz Alerts so this can be dynamic, or at
         * least set this via config variable.
         */
        const fieldsToSave = [
          'business_name',
          'helping_employer_response',
          'number_of_employees',
        ];

        fieldsToSave.forEach((fieldName) => {
          createContactPayload[startCase(fieldName)] = fields ? fields[fieldName] : null;
        });

        contactRecord = await airtable.createRecord(contactsTableName, createContactPayload);

        logger.debug('Created Airtable contact', contactRecord);
      }

      const payload = {
        'Contact ID': uuid,
        'Contact': contactRecord.id,
      };

      Object.keys(results).forEach((fieldName) => {
        const { category, value } = results[fieldName];

        payload[startCase(fieldName)] = category === 'All Responses' ? value : category;
      });

      console.log('payload', payload);

      if (req.query.test) {
        logger.debug('Skipping send to Airtable');

        return next();
      }

      const airtableRes = await airtable.createRecord(tableName, payload);

      logger.debug('Airtable response', airtableRes.body);

      req.data = {
        payload,
        response: airtableRes.body,
      };

      return next();
    } catch (error) {
      return next(error);
    }
  }
};
