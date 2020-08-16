'use strict';

require('dotenv').config();

const client = require('superagent');
const logger = require('heroku-logger');

const textIt = require('./lib/text-it');

const isEnabled = false;

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
 * Find the batch group with the largest index.
 * Batch groups are named with "Batch {index}".
 *
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
 * @return {Array}
 */
const formatContactsAsLinks = (contacts) => {
  return contacts.map(contactId => textIt.getUrlForContactId(contactId));
}

/**
 * Adds new subscribers to current batch group, or creates new group if full.
 *
 * @async
 * @param {Array} contacts
 * @param {Object} group
 * @return {Promise}
 */
module.exports.addContactsToBatchGroup = async (contacts, group) => {
  if (!contacts.length) {
    logger.debug('No contacts to add to a batch group.');

    return;
  }

  const result = {};
  const batchSize = 100;
  const groupId = group.uuid;
  const spotsLeft = batchSize - group.count;
  const currentBatchGroupNumber = getBatchGroupNumber(group);
  const nextBatchGroupNumber = currentBatchGroupNumber + 1;

  // If there aren't any spots left, we can create a group and add up to our batchSize.
  if (!spotsLeft) {
    contacts.splice(0, batchSize);

    // Add contacts to group if worker is enabled.
    await createNewBatchGroupWithContacts(nextBatchGroupNumber, contacts);

    result[nextBatchGroupNumber] = contacts;

    return result;
  }

  // Otherwise remove enough contacts to fill the first group.
  const firstBatch = contacts.splice(0, spotsLeft);

  result[currentBatchGroupNumber] = firstBatch;

  console.log(result);

  if (isEnabled) {
    // Add them to our existing batch group.
    await textIt.createContactAction({ contacts: firstBatch, groupId });
  }

  // If there are still contacts left to add:
  if (contacts.length) {
    // Get the next 100 contacts and add to a new group.
    await createNewBatchGroupWithContacts(nextBatchGroupNumber, contacts.splice(0, batchSize));
  }

  return result;
};

/**
 * Creates a new batch group with given index, and adds given contacts.
 *
 * @async
 * @param {Number} index
 * @param {Array} contacts
 * @return {Promise<Object>}
 */
const createNewBatchGroupWithContacts = async (index, contacts) => {
  if (!isEnabled) {
    return Promise.resolve(true);
  }

  const group = await textIt.createGroup(`Batch ${index}`);

  await textIt.createContactAction({ contacts, groupId: group.uuid });

  return group;
}

// Places new subscribers into a batch group, if they haven't been added to one yet.
const main = async () => {
  const newSubscribers = await getNewSubscribers();
  const lastBatchGroup = await getLastBatchGroup();

  logger.debug('data', { newSubscribers, lastBatchGroup });

  await module.exports.addContactsToBatchGroup(newSubscribers, lastBatchGroup);
};

(async () => {
  main();
})();
