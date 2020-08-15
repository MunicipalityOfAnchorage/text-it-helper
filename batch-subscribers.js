'use strict';

require('dotenv').config();

const logger = require('heroku-logger');

const textIt = require('./lib/text-it');

/**
 * @param {Object} group
 * @return {Number}
 */
const getBatchGroupNumber = (group) => {
  if (!group.name.includes('Batch ')) {
    return null;
  }

  const groupNameParts = group.name.split(' ');

  return Number(groupNameParts[1]);
};

/**
 * @param {Object} group
 * @return {Boolean}
 */
const isContactInABatchGroup = (contact) => {
  return contact.groups.some(group => getBatchGroupNumber(group));
};

/**
 * @return {Object}
 */
const getLastBatchGroup = async () => {
  let lastBatchGroup = null;
  let lastBatchGroupNumber = null;

  try {
    // Get first page of groups.
    let res = await textIt.getGroups();

    let { results } = res;
    let nextPage = res.next;
    let i = 0;

    while (results || nextPage) {
      results.forEach((group) => {
        const batchGroupNumber = getBatchGroupNumber(group);

        if (batchGroupNumber > lastBatchGroupNumber) {
          lastBatchGroup = group;
          lastBatchGroupNumber = batchGroupNumber;
        }
      });

      logger.debug(`Found ${results.length} groups`);

      if (nextPage) {
        res = await textIt.getByUrl(nextPage);

        results = res.body.results;
        nextPage = res.body.next;       
      } else {
        break;
      }
    }

    return lastBatchGroup;
  } catch (error) {
    logger.error('getLastBatchGroup', { error: error.message });
  }
}

/**
 * @return {Array}
 */
const getNewSubscribers = async () => {
  const newSubscribers = [];

  try {
    // Get first page of subscribers.
    let subscribersRes = await textIt.getFirstPageOfAllSubscribersGroupMembers();

    let { results } = subscribersRes;
    let nextPage = subscribersRes.next;

    while (results || nextPage) {
      results.forEach((contact) => {
        if (!isContactInABatchGroup(contact)) {
          newSubscribers.push(contact.uuid);
        }   
      });

      logger.debug(`Checked ${results.length} subscribers`);

      if (nextPage) {
        subscribersRes = await textIt.getByUrl(nextPage);

        results = subscribersRes.body.results;
        nextPage = subscribersRes.body.next;       
      } else {
        break;
      }
    }
    return newSubscribers;
  } catch (error) {
    logger.error('checkForNewSubscribers', error);
  }
};

/**
 * @param {Array} contacts
 * @param {Object} group
 */
const addContactsToBatchGroup = async (contacts, group) => {
  let lastBatchGroup = group;

  // If group count is greater than 100
  if (lastBatchGroup.count === 100) {
    // Create a new group and set it to lastBatchGroup.

  }

  if (contacts.length <= 100 - group.count) {
    // Add the contacts. Otherwise add the max here, and check create a new group
  } else {

  }

};

const main = async () => {
  const newSubscribers = await getNewSubscribers();
  const lastBatchGroup = await getLastBatchGroup();

  logger.debug('data', { newSubscribers, lastBatchGroup });

  // await addContactsToBatchGroup(newSubscribers, lastBatchGroup);
};

(async () => {
  main();
})();
