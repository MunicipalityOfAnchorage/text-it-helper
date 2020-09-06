'use strict';

require('dotenv').config();

const { argv } = require('yargs')
const logger = require('heroku-logger');

const batches = require('./lib/batches');
const digest = require('./lib/tasks/digest');

// Places new subscribers into a batch group, if they haven't been added to one yet.
const main = async () => {
  try {
    if (argv.task === 'digest') {
      const result = await digest.send();

      console.log({ result }); 
      return;
    }

    const newSubscribers = await batches.getNewSubscribers();
    logger.debug('newSubscribers', newSubscribers);

    const lastBatchGroup = await batches.getLastBatchGroup();
    logger.debug('lastBatchGroup', lastBatchGroup);

    const result = await batches.addContactsToBatchGroup(newSubscribers, lastBatchGroup);
    logger.info(result ? 'updated batch groups' : 'no batch group updates', { result }); 
  } catch (error) {
    logger.error('batch groups error', { error: error.message });
  }
};

(async () => {
  main();
})();
