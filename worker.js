'use strict';

require('dotenv').config();

const batches = require('./lib/batches');

// Places new subscribers into a batch group, if they haven't been added to one yet.
const main = async () => {
  const newSubscribers = await batches.getNewSubscribers();
  const lastBatchGroup = await batches.getLastBatchGroup();

  logger.debug('data', { newSubscribers, lastBatchGroup });

  await batches.addContactsToBatchGroup(newSubscribers, lastBatchGroup);
};

(async () => {
  main();
})();
