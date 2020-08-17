'use strict';

const client = require('superagent');
const logger = require('heroku-logger');

const { apiToken, testModeEnabled } = require('../../config/lib/services/text-it');

const baseUri = 'https://api.textit.in/api/v2/';

/**
 * Execute a GET request to the TextIt API.
 *
 * @param {String} path
 * @param {Object} query
 * @return {Promise}
 */
function get(path, query = {}) {
  logger.debug('TextIt GET', { path, query });

  return client
    .get(`${baseUri}${path}.json`)
    .query(query)
    .set('Authorization', `Token ${apiToken}`);
}

/**
 * Execute a POST request to the TextIt API.
 *
 * @param {String} path
 * @param {Object} data
 * @return {Promise}
 */
function post(path, data) {
  logger.info('TextIt POST', { path, data });

  if (testModeEnabled) {
    logger.info('TextIt test mode is enabled');

    return Promise.resolve(true);
  }

  return client
    .post(`${baseUri}${path}.json`)
    .set('Authorization', `Token ${apiToken}`)
    .send(data);
}

/**
 * Execute a GET request to the TextIt API by URL.
 *
 * @param {String} url
 * @return {Promise}
 */
module.exports.getByUrl = (url) => {
  logger.debug('TextIt GET', { url });

  return client.get(url)
    .set('Authorization', `Token ${apiToken}`);
}

/**
 * Fetch first page of contacts by group ID.
 *
 * @param {String} groupId
 * @return {Promise}
 */
module.exports.getContactsByGroupId = (groupId) => {
  return get('contacts', { group: groupId })
    .then(res => res.body);
};

/**
 * Fetch contact by ID.
 *
 * @param {String}
 * @return {Promise}
 */
module.exports.getContactById = (contactId) => {
  return get('contacts', { uuid: contactId })
    .then(res => res.body.results[0]);
};

/**
 * Fetch first page of groups.
 *
 * @param {String}
 * @return {Promise}
 */
module.exports.getGroups = () => {
  return get('groups').then(res => res.body);
};

/**
 * Create a new group.
 *
 * @param {String} name
 * @return {Promise}
 */
module.exports.createGroup = (name) => {
  return post('groups', { name })
    .then(res => res.body);
}

/**
 * Creates a contact action.
 *
 * @param {Array} contacts
 * @param {String} groupId
 * @param {String} action
 * @return {Promise}
 */
module.exports.createContactAction = ({ contacts, groupId, action = 'add' }) => {
  const data = {
    action,
    contacts,
    group: groupId, 
  };

  return post('contact_actions', data).then(res => res.body);
}

/**
 * Returns web URL for a contact.
 *
 * @param {String} contactId
 * @return {String}
 */
module.exports.getUrlForContactId = (contactId) => {
  return `https://textit.in/contact/read/${contactId}`;
}

/**
 * Returns web URL for a group.
 *
 * @param {String} groupId
 * @return {String}
 */
module.exports.getUrlForGroupId = (groupId) => {
  return `https://textit.in/contact/filter/${groupId}`;
}
