'use strict';

const airtable = require('../services/airtable');

const fetchData = async () => {
  const tableName = process.env.DIGEST_AIRTABLE_TABLE_NAME;

  const res = await airtable.get(
    tableName,
    { filterByFormula: 'IS_AFTER(LAST_MODIFIED_TIME(),(DATEADD(TODAY(), -1, "hours")))'}
  );

  const { records } = res.body;

  return `Found ${records.length} records`;
};

module.exports.send = async () => {
  return await fetchData();
};
