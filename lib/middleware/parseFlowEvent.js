'use strict';

const { assign, cloneDeep } = require('lodash');
const logger = require('heroku-logger');

const formatters = require('../formatters');
const textIt = require('../services/text-it');

module.exports = function parseFlowEvent() {
  return async (req, res, next) => {
    try {
      const { body } = req;

      logger.debug('Received TextIt flow event', { body });

      const { contact, flow, results } = body;
      const { uuid } = contact;

      const getContactRes = await textIt.getContactById(uuid);

      logger.debug('TextIt getContactRes', getContactRes);

      req.contact = formatters.formatTextItContact(getContactRes ? getContactRes : contact);
      req.flow = formatters.startCaseObjectKeys(flow);

      const getFlowRes = await textIt.getFlowById(flow.uuid);

      logger.debug('TextIt getFlowRes', getContactRes);

      req.results = formatters.formatTextItResults(results, getFlowRes.results);

      // Save the payload to send to Zapier and as the response to this API request.
      req.data = cloneDeep(req.contact);
      req.data.Flow = req.flow.Name;
      req.data.Submitted = new Date().toISOString();

      assign(req.data, req.results);
   
      // Initialize to save responses when forwarding flow event to third-party services.
      req.responses = {};

      return next();
    } catch (error) {
      return next(error);
    }
  }
};
