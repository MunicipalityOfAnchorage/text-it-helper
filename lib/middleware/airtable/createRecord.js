'use strict';

const { startCase } = require('lodash');
const logger = require('heroku-logger');
const superagent = require('superagent');

const airtable = require('../../services/airtable');

module.exports = function createRecord() {
  return async (req, res, next) => {
    try {
      const tableName = encodeURI(startCase(req.query.table));

      if (!tableName) {
        return res.status(422).send('Missing table query parameter');
      }

      const payload = {
        'Contact ID': req.data.uuid,
      };

      Object.keys(req.data.results).forEach((fieldName) => {
        const { category, value } = req.data.results[fieldName];

        payload[startCase(fieldName)] = category === 'All Responses' ? value : category;
      });

      if (req.query.test) {
        logger.debug('Skipping send to Airtable');

        return next();
      }

      const airtableRes = await airtable.createRecord(tableName, payload);

      logger.debug('Airtable response', airtableRes.body);

      return next();
    } catch (error) {
      return next(error);
    }
  }
};
