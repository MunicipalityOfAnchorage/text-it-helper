'use strict';

const client = require('superagent');
const logger = require('heroku-logger');

/**
 * Execute a POST request to a Zapier webhook.
 *
 * @param {String} id1
 * @param {String} id2
 * @param {Object} data
 * @return {Promise}
 */
module.exports.postWebhook = ({ id1, id2, data }) => {
  logger.debug('Zapier POST', { id1, id2, data });

  return client.post(`https://hooks.zapier.com/hooks/catch/${id1}/${id2}`).send(data);
}
