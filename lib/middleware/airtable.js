'use strict';

const logger = require('heroku-logger');
const superagent = require('superagent');
const { assign, isEqual, omit, startCase } = require('lodash');

const airtable = require('../services/airtable');

/**
 * @param {String} tableName
 * @param {Object} fields
 * @return {Boolean}
 */
const findOrCreateAirtableRecord = async (tableName, primaryFieldName, fields) => {
  let record = await airtable
    .getRecordByFieldName(tableName, primaryFieldName, fields[primaryFieldName]);

  if (record) {
    logger.debug('Found Airtable record', { tableName, primaryFieldName, record });

    if (isEqual(record.fields, fields)) {
      return record;
    }

    const { id } = record;

    return await airtable.patchRecord(
      tableName,
      assign({ id }, { fields: omit(fields, [primaryFieldName, 'Flow', 'Contact', 'Ignore']) }),
    );
  }

  record = await airtable.createRecord(tableName, fields);

  logger.debug('Created Airtable record', { tableName, primaryFieldName, record });

  return record;
};


module.exports = function createRecord() {
  return async (req, res, next) => {
    try {
      const flowEventTableName = startCase(req.query.airtable);

      if (!flowEventTableName) {
        return next();
      }

      const contactRecord = await findOrCreateAirtableRecord('Contacts', 'Uuid', req.contact);
      const flowRecord = await findOrCreateAirtableRecord('Flows', 'Uuid', req.flow);

      const payload = assign({
        'Contact': contactRecord.id,
        'Flow': flowRecord.id,
      }, req.results);

      if (req.runId) {
        payload.Run = req.runId;
      }

      const flowEventRecord = await findOrCreateAirtableRecord(flowEventTableName, 'Run', payload);

      logger.debug('createRecord response', flowEventRecord);

      req.responses['airtable'] = flowEventRecord;

      return next();
    } catch (error) {
      return next(error);
    }
  }
};
