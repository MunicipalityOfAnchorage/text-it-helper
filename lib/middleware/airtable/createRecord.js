'use strict';

const logger = require('heroku-logger');
const superagent = require('superagent');
const { assign, startCase } = require('lodash');

const airtable = require('../../services/airtable');
const { findOrCreateAirtableRecord } = require('../../helpers');

module.exports = function createRecord() {
  return async (req, res, next) => {
    try {
      const flowEventTableName = startCase(req.query.table);

      if (!flowEventTableName) {
        return res.status(422).send('Missing table query parameter');
      }

      const contactRecord = await findOrCreateAirtableRecord('Contacts', req.contact);
      const flowRecord = await findOrCreateAirtableRecord('Flows', req.flow);

      const payload = assign({
        'Contact': contactRecord.id,
        'Flow': flowRecord.id,
      }, req.results);

      const flowEventRecord = await airtable.createRecord(flowEventTableName, payload);

      logger.debug('createRecord response', flowEventRecord);

      req.data = {
        Payload: payload,
        Response: flowEventRecord,
      };

      return next();
    } catch (error) {
      return next(error);
    }
  }
};
