'use strict';

require('dotenv').config();

const logger = require('heroku-logger');

const textIt = require('./api/services/text-it');

const getAllBatchGroups = async () => {
  const groups = [];

  try {
    // Get first page of groups.
    let res = await textIt.get('groups');

    let { results } = res.body;
    let nextPage = res.next;
    let i = 0;

    while (results || nextPage) {
      results.forEach((group) => {
        if (group.name.includes('Batch ')) {
          groups.push(group);
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

    console.log(groups);

    return groups;
  } catch (error) {
    console.log(error);
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
  const batchGroups = getAllBatchGroups();
})();
