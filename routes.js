'use strict';

const logger = require('heroku-logger');

const authenticateMiddleware = require('./lib/middleware/authenticate');
const sendResponseMiddleware = require('./lib/middleware/sendResponse');
const parseFlowEventMiddleware = require('./lib/middleware/parseFlowEvent');
const postZapierWebhookMiddleware = require('./lib/middleware/zapier/postZapierWebhook');

/**
 * API routes.
 */
module.exports = (app) => {
  app.use(authenticateMiddleware());

  app.get('/', (req, res) => res.send('OK'));

  app.post('/api/v1/zapier/:id1/:id2',
    parseFlowEventMiddleware(),
    postZapierWebhookMiddleware(),
    sendResponseMiddleware());

  // Error handler
  app.use((error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message;

    logger.error('Sending response', { status, message });

    return res.status(status).send({ message });
  });
};
