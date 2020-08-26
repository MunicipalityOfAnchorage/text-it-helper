'use strict';

const { assign, omit, pick, startCase } = require('lodash');

const { getUrlForContactId } = require('./services/text-it');

/**
 * @param {Object} data
 * @return {Object}
 */
module.exports.startCaseObjectKeys = (data) => {
  const formatted = {};

  Object.keys(data).forEach((fieldName) => {
    formatted[startCase(fieldName)] = data[fieldName];
  })

  return formatted;
};

/**
 * @param {Object} contact
 * @return {Object}
 */
module.exports.formatTextItContact = (contact) => {
  const { created_on, fields = {}, groups = [], name, uuid, urns = [] } = contact;
  // Assumes we're only supporting SMS.
  const phone = urns.length ? contact.urns[0] : contact.urn;

  return module.exports.startCaseObjectKeys(
    assign({
      uuid,
      name,
      phone,
      profile: getUrlForContactId(uuid),
      created_on,
      groups: groups ? groups.map(group => group.name).join(', ') : null,
    // TODO: This should be set via config variable.
    }, pick(fields, [
      'business_name',
      'helping_employer_response',
      'number_of_employees',
    ]))
  );
};

/**
 * @param {Object} results
 * @return {Object}
 */
module.exports.formatTextItResults = (results) => {
  const formatted = {};

  Object.keys(results).forEach((fieldName) => {
    const { category, value } = results[fieldName];
    const openTextCategories = ['All Responses', 'Has Text'];

    formatted[startCase(fieldName)] = openTextCategories.includes(category) ? value : category;
  });

  return formatted;
};

/**
 * @param {String} fieldName
 * @param {String} fieldValue
 * @return {String}
 */
const getPlainTextLine = (fieldName, fieldValue) => `${fieldName}:\n${fieldValue}\n\n`;

/**
 * @param {Object} data
 * @return {String}
 */
const getPlainTextFromObject = (data) => Object.keys(data)
  .map(fieldName => getPlainTextLine(fieldName, data[fieldName]))
  .join('\n');

/**
 * @param {Object}
 * @return {String}
 */
module.exports.getPlainTextFromReq = (req) => {
  const contact = getPlainTextFromObject(omit(req.contact, 'Uuid'));
  const results = getPlainTextFromObject(req.results);

  return `${contact}Flow Name:\n\n${req.flow.Name}\n\n${results}`;
};
