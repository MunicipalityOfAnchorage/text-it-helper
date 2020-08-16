'use strict';

const test = require('ava');
const chai = require('chai');
const nock = require('nock');

const worker = require('../worker');

chai.should();

test.afterEach(() => {
  nock.cleanAll();
});

/** @test */
test('Result contains a single property for current batch if enough spots left', async (t) => {
  const contacts = [1, 2, 3];
  const group = {
    name: 'Batch 7',
    count: 50,
  };

  const result = await worker.addContactsToBatchGroup(contacts, group);

  t.deepEqual(result['7'], [1, 2, 3]);
});
