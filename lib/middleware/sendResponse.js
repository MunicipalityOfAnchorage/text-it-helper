'use strict';

const logger = require('heroku-logger');

module.exports = function sendResponse() {
  return (req, res) => {
    logger.debug('Sending data', req.data);

    res.send(req.data);
  };
};
