'use strict';

const logger = require('heroku-logger');

const authenticateMiddleware = require('./middleware/authenticate');
const sendResponseMiddleware = require('./middleware/sendResponse');
const getContactMiddleware = require('./middleware/inbox/getContact');
const parseFlowEventMiddleware = require('./middleware/inbox/parseFlowEvent');
const postZapierWebhookMiddleware = require('./middleware/inbox/postZapierWebhook');
const addSubcribersMiddleware = require('./middleware/subscriberGroups/addSubscribers');
const getSubcribersMiddleware = require('./middleware/subscriberGroups/getSubscribers');
const createSubscriberGroupsMiddleware = require('./middleware/subscriberGroups/createSubscriberGroups');

/**
 * API routes.
 */
module.exports = (app) => {
  app.use(authenticateMiddleware());

  app.get('/', (req, res) => res.send('OK'));

  app.post('/api/v1/subscriber-groups',
    createSubscriberGroupsMiddleware(),
    getSubcribersMiddleware(),
    addSubcribersMiddleware(),
    sendResponseMiddleware());

  app.post('/api/v1/inbox',
    parseFlowEventMiddleware(),
    getContactMiddleware(),
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
