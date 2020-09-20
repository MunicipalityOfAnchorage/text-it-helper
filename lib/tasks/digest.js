'use strict';

const client = require('superagent');
const logger = require('heroku-logger');
const { isEqual, pick, startCase } = require('lodash');

const textIt = require('../services/text-it');
const airtable = require('../services/airtable');
const config = require('../../config/lib/tasks/digest');

const tableName = config.airtableTableName;
const flowValueNames = config.textItFlowValueNames;
const airtableFieldNames = flowValueNames.map(name => startCase(name));

// TODO: DRY with formatters.
const openTextCategories = ['All Responses', 'Has Text'];

/**
 * Fetch all Airtable records and return as a map indexed by run ID.
 *
 * @return {Object}
 */
const fetchRecordsByRunId = async () => {
  const recordsByRunId = {};

  let tableRecordsRes = await airtable.get(tableName);

  let { records, offset } = tableRecordsRes.body;

  while (records || next) {
    records.forEach((record) => {
      const { id, fields } = record;
      const data = {};

      airtableFieldNames.forEach((fieldName) => {
        if (fields[fieldName]) {
          data[fieldName] = fields[fieldName];
        }
      })

      recordsByRunId[fields.Run] = {
        id,
        data,
      };
    });

    if (offset) {
      tableRecordsRes = await airtable.get(tableName, { offset });

      records = tableRecordsRes.body.records;
      offset = tableRecordsRes.body.offset;
    } else {
      break;
    }
  }

  return recordsByRunId;
};

/**
 * Fetch all runs and check if Airtable records should be created or modified.
 *
 * @return {Object}
 */
const compareRecordsAndRuns = async () => {
  const recordsByRunId = await fetchRecordsByRunId();

  const newRecords = [];
  const modifiedRecordsByAirtableId = {};


  try {
    // Get first page of runs.
    let runsRes = await textIt.getRunsByFlowId(config.textItFlowId);

    let { next, results } = runsRes;

    while (results || next) {
      results.forEach((result) => {
        const payload = {};
        const runId = result.uuid;

        logger.debug('Checking run', { runId });

        const contactId = result.contact.uuid;
        const flowId = result.flow.uuid;
        const { values } = result;

        // Transform TextIt data as payload for an Airtable record.
        flowValueNames.forEach((fieldName) => {
          const fieldValue = values[fieldName];

          if (!fieldValue) {
            return;
          }

          const { category, value  } = fieldValue;

          payload[startCase(fieldName)] = openTextCategories.includes(category) ? value : category;
        });

        if (!Object.keys(payload).length) {
          return;
        }

        logger.debug('payload', payload);

        const airtableRecord = recordsByRunId[runId];

        if (!airtableRecord) {
          logger.debug('Adding airtable record');

          return newRecords.push(result);          
        }

        if (!isEqual(payload, airtableRecord.data)) {
          logger.debug('Needs update', { airtableId: airtableRecord.id });
          modifiedRecordsByAirtableId[airtableRecord.id] = payload;

          return;
        }

        logger.debug('Run values are equal in Airtable');
      });

      logger.debug(`Added ${results.length} runs.`);

      if (next) {
        runsRes = await textIt.getByUrl(next);

        results = runsRes.body.results;
        next = runsRes.body.next;       
      } else {
        break;
      }
    }

    return {
      newRecords,
      modifiedRecordsByAirtableId,
    };

  } catch (error) {
    logger.error('checkForNewSubscribers', { error: error.message });

    throw error;
  }
};

module.exports.send = async () => {
  const data = await compareRecordsAndRuns();

  console.log(data);
  console.log('created length', data.newRecords.length);
  console.log('updated length', Object.keys(data.modifiedRecordsByAirtableId).length);

  // if (!data[tableName].modifiedCount) {
  //   logger.info('Skipping sending to Zapier - no records modified');

  //   return null;
  // }

  //const res = await client.post(config.zapierWebhook).send(data);

  //logger.info('POST to Zapier', { res: res.body });
};
