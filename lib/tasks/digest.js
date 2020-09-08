'use strict';

const client = require('superagent');
const logger = require('heroku-logger');

const airtable = require('../services/airtable');
const config = require('../../config/lib/tasks/digest');
const tableName = config.airtableTableName;

const fetchData = async () => {
  const res = await airtable.get(
    tableName,
    { filterByFormula: 'IS_AFTER(LAST_MODIFIED_TIME(),(DATEADD(TODAY(), -1, "hours")))'}
  );

  const { records } = res.body;
  const data = {};

  data[tableName] = {
    modifiedCount: records.length,
  };

  logger.info('Digest results', { data });

  return data;
};

module.exports.send = async () => {
  const data = await fetchData();

  if (!data[tableName].modifiedCount) {
    logger.info('Skipping sending to Zapier - no records modified');

    return null;
  }

  const res = await client.post(config.zapierWebhook).send(data);

  logger.info('POST to Zapier', { res: res.body });
};
