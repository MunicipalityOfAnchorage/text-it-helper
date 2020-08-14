'use strict';

require('dotenv').config();

const logger = require('heroku-logger');

const textIt = require('./api/services/text-it');

const getAllSubscribersGroup = async () => {
  const res = await textIt.getAllSubscribersGroup();

  console.log(res);
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
  await checkForNewSubscribers();
})();
