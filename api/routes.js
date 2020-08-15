'use strict';

const logger = require('heroku-logger');

const authenticateMiddleware = require('./middleware/authenticate');
const sendResponseMiddleware = require('./middleware/sendResponse');
const parseFlowEventMiddleware = require('./middleware/parseFlowEvent');
const postZapierWebhookMiddleware = require('./middleware/zapier/postZapierWebhook');

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
