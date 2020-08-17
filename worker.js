'use strict';

require('dotenv').config();

const logger = require('heroku-logger');

const batches = require('./lib/batches');

// Places new subscribers into a batch group, if they haven't been added to one yet.
const main = async () => {
  const newSubscribers = await batches.getNewSubscribers();
  const lastBatchGroup = await batches.getLastBatchGroup();
  const result = await batches.addContactsToBatchGroup(newSubscribers, lastBatchGroup);

  logger.info('batch group results', { result });
};

(async () => {
  main();
})();
