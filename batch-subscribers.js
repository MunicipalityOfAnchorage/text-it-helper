'use strict';

require('dotenv').config();

const logger = require('heroku-logger');

const textIt = require('./api/services/text-it');

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
 * @return {Object}
 */
const getLastBatchGroup = async () => {
  let lastBatchGroup = null;
  let lastBatchGroupNumber = null;

  try {
    // Get first page of groups.
    let res = await textIt.get('groups');

    let { results } = res.body;
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

    console.log(lastBatchGroup);

    return lastBatchGroup;
  } catch (error) {
    logger.error('getLastBatchGroup', error);
  }
}

const checkForNewSubscribers = async () => {
  try {
    // Get first page of subscribers.
    let subscribersRes = await textIt.getFirstPageOfAllSubscribersGroupMembers();

    let { results } = subscribersRes;
    let nextPage = subscribersRes.next;
    let i = 0;

    while (results || nextPage) {
      results.forEach((contact) => {
        console.log(i, contact);   
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
  } catch (error) {
    console.log(error);
  }
};

(async function() {
  const batchGroups = getLastBatchGroup();
})();
