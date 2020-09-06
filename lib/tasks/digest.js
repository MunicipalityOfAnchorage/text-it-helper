'use strict';

const airtable = require('../services/airtable');

const fetchData = async () => {
  const targetTime = new Date();
  targetTime.setHours(targetTime.getHours() - 2);
  const targetTimeString = targetTime.toISOString();

  const res = await airtable.get(
    process.env.DIGEST_AIRTABLE_TABLE_NAME,
    { filterByFormula: 'IS_AFTER(CREATED_TIME(),(DATEADD(TODAY(), -2, "days")))'}
  );

  return res.body.records;
};

module.exports.send = async () => {
  return await fetchData();
};
