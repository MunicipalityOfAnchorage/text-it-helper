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
 * Executes TextIt API request to add given contacts to a given group.
 *
 * @async
 * @param {Array} contacts
 * @param {Object} group
 * @return {Promise}
 */
const addContactsToBatchGroup = async (contacts, group) => {
  if (!contacts.length) {
    logger.debug('No contacts to add to a batch group.');

    return;
  }

  const groupId = group.uuid;
  const spotsLeft = 100 - group.count;
 
  if (contacts.length < spotsLeft) {
    // Add contacts to group if worker is enabled.
    if (isEnabled) {
      await textIt.createContactAction({ contacts, groupId });
    }

    const data = {
      contacts: formatContactsAsLinks(contacts).join(', '),
      group: textIt.getUrlForGroupId(groupId)
    };

    logger.debug('addContactsToBatchGroup', { data });

    return;
  }

  // TODO: Create a new group and split.
};

/**
 * Creates a new batch group with given index, and adds given contacts.
 *
 * @async
 * @param {Number} index
 * @param {Array} contacts
 * @return {Promise}
 */
const createNewBatchGroupWithContacts = async (index, contacts) => {
  const group = await textIt.createGroup(`Batch ${index}`);

  const groupId = group.uuid

  return textIt.createContactAction({ contacts, groupId })/;
}

// Places new subscribers into a batch group, if they haven't been added to one yet.
const main = async () => {
  const newSubscribers = await getNewSubscribers();
  const lastBatchGroup = await getLastBatchGroup();

  logger.debug('data', { newSubscribers, lastBatchGroup });

  await addContactsToBatchGroup(newSubscribers, lastBatchGroup);
};

(async () => {
  main();
})();
