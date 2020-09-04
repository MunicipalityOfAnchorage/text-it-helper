'use strict';

const logger = require('heroku-logger');
const superagent = require('superagent');
const { assign, omit, startCase } = require('lodash');

const airtable = require('../services/airtable');

// This is the field name that should be used to store the result of posts to our API.
const apiResponseFieldName = 'API Response';

/**
 * @param {String} tableName
 * @param {Object} fields
 * @return {Boolean}
 */
const upsert = async (tableName, primaryFieldName, fields) => {
  const primaryFieldValue = fields[primaryFieldName];

  let record = await airtable
    .getRecordByFieldName(tableName, primaryFieldName, primaryFieldValue);

  if (!record) {
    record = await airtable.createRecord(tableName, fields);

    logger.debug('Created Airtable record', { tableName, primaryFieldName, record });

    return record;
  }

  logger.debug('Found Airtable record', { tableName, primaryFieldName, record });

  const updates = {};

  Object.keys(omit(fields, ['Flow', 'Contact', apiResponseFieldName])).forEach((fieldName) => {
    const fieldValue = fields[fieldName];

    if (fieldValue !== record.fields[fieldName]) {
      updates[fieldName] = fieldValue;
    }
  });

  if (!Object.keys(updates).length) {
    logger.debug('No updates for Airtable record', {
      tableName,
      primaryFieldName,
      primaryFieldValue,
    });

    return record;
  }

  const { id } = record;

  return await airtable.patchRecord(
    tableName,
    assign({ id }, { fields: updates }),
  );
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

      if (req.data.Run) {
        payload.Run = req.data.Run;
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
