'use strict';

require('dotenv').config();

const logger = require('heroku-logger');

const batches = require('./lib/batches');

// Places new subscribers into a batch group, if they haven't been added to one yet.
const main = async () => {
  const newSubscribers = await batches.getNewSubscribers();

  logger.debug('newSubscribers', newSubscribers);

  const lastBatchGroup = await batches.getLastBatchGroup();

  logger.debug('lastBatchGroup', lastBatchGroup);

  const result = await batches.addContactsToBatchGroup(newSubscribers, lastBatchGroup);

  logger.info(result ? 'updated batch groups' : 'no batch group updates', { result });
};

(async () => {
  main();
})();
