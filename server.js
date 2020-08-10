'use strict';

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require('./api/routes')(app);

app.get('/', (req, res) => {
  res.send('hi');
});

module.exports = app;
