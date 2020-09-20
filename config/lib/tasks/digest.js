'use strict';

module.exports = {
  airtableTableName: process.env.DIGEST_AIRTABLE_TABLE_NAME,
  textItFlowId: process.env.DIGEST_TEXT_IT_FLOW_ID,
  textItFlowValueNames: process.env.DIGEST_TEXT_IT_FLOW_VALUE_NAMES.split(','),
  zapierWebhook: process.env.DIGEST_ZAPIER_WEBHOOK,
};
