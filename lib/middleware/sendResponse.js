'use strict';

const { assign } = require('lodash');
const logger = require('heroku-logger');

module.exports = function sendResponse() {
  return (req, res) => {
    const data = req.data;

    // Save plain text to use in transactional emails from TextIt.
    data.Text = req.text;

    logger.debug('Sending data', { data} );

    res.send(data);
  };
};
