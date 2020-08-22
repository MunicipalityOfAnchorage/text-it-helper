'use strict';

const logger = require('heroku-logger');

const airtable = require('./services/airtable');

/**
 * @param {String} tableName
 * @param {Object} fields
 * @return {Boolean}
 */
module.exports.findOrCreateAirtableRecord = async (tableName, fields) => {
  let record = await airtable.getRecordByUuid(tableName, fields.Uuid);

  if (record) {
    logger.debug('Found Airtable record', { tableName, record });

    return record;
  }

  record = await airtable.createRecord(tableName, fields);

  logger.debug('Created Airtable record', { tableName, record });

  return record;
};
