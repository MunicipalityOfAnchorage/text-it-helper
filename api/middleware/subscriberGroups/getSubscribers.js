'use strict';

const logger = require('heroku-logger');

const textIt = require('../../services/text-it');

module.exports = function getContacts() {
  return async (req, res, next) => {
    try {
      // Get first page of subscribers.
      let subscribersRes = await textIt.getContactsByGroupId(req.groupId);

      let { results } = subscribersRes;
      let nextPage = subscribersRes.next;
      let i = 0;

      while (results || nextPage) {
        results.forEach(({ uuid }) => {
          req.groups[i].members.push(uuid);
          req.groups[i].count++;

          return i === 7 ? i = 0 : i++;     
        });

        logger.debug(`Batched ${results.length} subscribers`);

        if (nextPage) {
          subscribersRes = await textIt.getByUrl(nextPage);

          results = subscribersRes.body.results;
          nextPage = subscribersRes.body.next;       
        } else {
          break;
        }
      }

      return next();
    } catch (error) {
      return next(error);
    }
  }
};