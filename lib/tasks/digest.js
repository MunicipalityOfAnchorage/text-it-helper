'use strict';

const client = require('superagent');
const logger = require('heroku-logger');

const airtable = require('../services/airtable');
const config = require('../../config/lib/tasks/digest');

const fetchData = async () => {
  const tableName = config.airtableTableName;

  const res = await airtable.get(
    tableName,
    { filterByFormula: 'IS_AFTER(LAST_MODIFIED_TIME(),(DATEADD(TODAY(), -1, "hours")))'}
  );

  const { records } = res.body;
  const data = {};

  data[tableName] = {
    modifiedCount: records.length,
  };

  return data;
};

module.exports.send = async () => {
  const data = await fetchData();

  const res = await client.post(config.zapierWebhook).send(data);

  logger.debug('POST to Zapier', { res: res.body });
};
