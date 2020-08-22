'use strict';

const logger = require('heroku-logger');
const superagent = require('superagent');
const { assign, startCase } = require('lodash');

const { findOrCreateAirtableRecord } = require('../../helpers');
const airtable = require('../../services/airtable');


module.exports = function createRecord() {
  return async (req, res, next) => {
    try {
      const contactsTableName = 'Contacts';
      const flowEventTableName = startCase(req.query.table);

      if (!flowEventTableName) {
        return res.status(422).send('Missing table query parameter');
      }

      const contactRecord = await findOrCreateAirtableRecord('Contacts', req.contact);
      const flowRecord = await findOrCreateAirtableRecord('Flows', req.flow);

      logger.debug('Found Airtable contact', contactRecord);

      const payload = assign({
        'Contact': contactRecord.id,
        'Flow': flowRecord.id,
      }, req.results);

      const flowEventRecord = await airtable.createRecord(flowEventTableName, payload);

      logger.debug('createRecord response', flowEventRecord.body);

      req.data = {
        payload,
        response: flowEventRecord.body,
      };

      return next();
    } catch (error) {
      return next(error);
    }
  }
};
