'use strict';

const client = require('superagent');
const logger = require('heroku-logger');

const { apiKey, baseId } = require('../../config/lib/services/airtable');

const baseUri = `https://api.airtable.com/v0/${baseId}/`;

/**
 * Execute a POST request to the Airtable baseId.
 *
 * @param {String} path
 * @param {Object} data
 * @return {Promise}
 */
function post(path, data) {
  logger.info('Airtable POST', { path, data });

  return client
    .post(`${baseUri}${path}`)
    .set('Authorization', `Bearer ${apiKey}`)
    .send(data);
}

/**
 * Creates a record in Airtable.
 *
 * @param {String} tableName
 * @param {Object} fields
 * @return {Promise}
 */
module.exports.createRecord = (tableName, fields) => post(tableName, {
  records: [{ fields }],
  //typecast: true,
});
