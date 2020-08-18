'use strict';

const logger = require('heroku-logger');

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
        'groups'
      ];

      contactFields.forEach(fieldName => plainTextResult.push(formatPlainTextField(
        fieldName,
        JSON.stringify(req.data[fieldName]),
      )));

      plainTextResult.push('flow', req.data.flow.name);

      Object.keys(req.data.results).forEach(fieldName => plainTextResult.push(formatPlainTextField(
        fieldName,
        JSON.stringify(req.data.results[fieldName]),
      )));

      Object.keys(req.data.fields).forEach((fieldName) => {
        plainTextResult.push(formatPlainTextField(fieldName, req.data.fields[fieldName]));
      });

      req.data = { text: plainTextResult.join('\n\n') }

      return next();
    } catch (error) {
      return next(error);
    }
  }
};
