'use strict';

const logger = require('heroku-logger');

const contactsMiddleware = require('./lib/middleware/contacts');
const airtableMiddleware = require('./lib/middleware/zapier');
const zapierMiddleware = require('./lib/middleware/airtable');
const authenticateMiddleware = require('./lib/middleware/authenticate');
const sendResponseMiddleware = require('./lib/middleware/sendResponse');
const parseFlowEventMiddleware = require('./lib/middleware/parseFlowEvent');

/**
 * API routes.
 */
module.exports = (app) => {
  app.use(authenticateMiddleware());

  app.get('/', (req, res) => res.send('OK'));

  app.post('/api/v1/contacts',
    contactsMiddleware());

  // To be deprecated by run-results
  app.post('/api/v1/flow-events',
    parseFlowEventMiddleware(),
    zapierMiddleware(),
    airtableMiddleware(),
    sendResponseMiddleware());

  app.post('/api/v1/run-results',
    parseFlowEventMiddleware(),
    zapierMiddleware(),
    airtableMiddleware(),
    sendResponseMiddleware());

  // Error handler
  app.use((error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message;

    logger.error('Sending response', { status, message });

    return res.status(status).send({ message });
  });
};
