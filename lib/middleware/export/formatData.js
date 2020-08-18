'use strict';

const logger = require('heroku-logger');

/**
 * @param {String} fieldName
 * @param {String} fieldValue
 * @return {String}
 */
const formatPlainTextField = (fieldName, fieldValue) => {
  return `${fieldName}: ${fieldValue}`;
}

module.exports = function formatData() {
  return async (req, res, next) => {
    try {
      const plainTextResult = [];

      const contactFields = [
        'name',
        'phone',
        'url',
        'created_on',
        'groups'
      ];

      contactFields.forEach(fieldName => plainTextResult.push(formatPlainTextField(
        fieldName,
        JSON.stringify(req.data[fieldName]),
      )));

      plainTextResult.push(formatPlainTextField('flow', req.data.flow.name));

      Object.keys(req.data.results).sort().forEach((fieldName) => {
        plainTextResult.push(formatPlainTextField(
          `${fieldName} category`,
          req.data.results[fieldName].category,
        ));
        plainTextResult.push(formatPlainTextField(
          `${fieldName} value`,
          req.data.results[fieldName].value,
        ));
      });

      req.data.fields ? Object.keys(req.data.fields).sort().forEach((fieldName) => {
        plainTextResult.push(formatPlainTextField(fieldName, req.data.fields[fieldName]));
      }) : null;

      req.data = { text: plainTextResult.join('\n\n') }

      return next();
    } catch (error) {
      return next(error);
    }
  }
};
