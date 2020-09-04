'use strict';

const logger = require('heroku-logger');
const superagent = require('superagent');
const { assign, isEqual, omit, startCase } = require('lodash');

const airtable = require('../services/airtable');

// This is the field name that should be used to store the result of posts to our API.
const apiResponseFieldName = 'API Response';

/**
 * @param {String} tableName
 * @param {Object} fields
 * @return {Boolean}
 */
const upsert = async (tableName, primaryFieldName, fields) => {
  let record = await airtable
    .getRecordByFieldName(tableName, primaryFieldName, fields[primaryFieldName]);

  if (record) {
    logger.debug('Found Airtable record', { tableName, primaryFieldName, record });

    const hasUpdated = Object.keys(omit(fields, apiResponseFieldName)).some((fieldName) => {
      return fields[fieldName] !== record.fields[fieldName];
    })

    if (!hasUpdated) {
      return record;
    }

    const { id } = record;

    return await airtable.patchRecord(
      tableName,
      assign({ id }, { fields: omit(fields, [primaryFieldName, 'Flow', 'Contact', apiResponseFieldName]) }),
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

      const contactRecord = await upsert('Contacts', 'Uuid', req.contact);
      const flowRecord = await upsert('Flows', 'Uuid', req.flow);

      const payload = assign({
        'Contact': contactRecord.id,
        'Flow': flowRecord.id,
      }, req.results);

      if (req.runId) {
        payload.Run = req.runId;
      }

      const flowEventRecord = await upsert(flowEventTableName, 'Run', payload);

      logger.debug('createRecord response', flowEventRecord);

      req.responses['airtable'] = flowEventRecord;

      return next();
    } catch (error) {
      return next(error);
    }
  }
};
