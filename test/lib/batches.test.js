'use strict';

const test = require('ava');
const chai = require('chai');
const nock = require('nock');

const batches = require('../../lib/batches');

chai.should();

test.afterEach(() => {
  nock.cleanAll();
});

/** @test */
test('Result contains a single property for new batch if current batch is full', async (t) => {
  const contacts = [1, 2, 3];
  const group = {
    name: 'Batch 7',
    count: 100,
  };

  const result = await batches.addContactsToBatchGroup(contacts, group);

  t.deepEqual(result['8'], [1, 2, 3]);
});

/** @test */
test('Result contains a single property for current batch if enough spots left', async (t) => {
  const contacts = [1, 2, 3];
  const group = {
    name: 'Batch 7',
    count: 50,
  };

  const result = await batches.addContactsToBatchGroup(contacts, group);

  t.deepEqual(result['7'], [1, 2, 3]);
});

/** @test */
test('Result contains properties for current and new batches if more subscribers than spots', async (t) => {
  const contacts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const group = {
    name: 'Batch 7',
    count: 95,
  };

  const result = await batches.addContactsToBatchGroup(contacts, group);

  t.deepEqual(result['7'], [1, 2, 3, 4, 5]);
  t.deepEqual(result['8'], [6, 7, 8, 9, 10]);
});

/** @test */
test('Does not create new batch if number of subscribers equals spots left', async (t) => {
  const contacts = [1, 2, 3];
  const group = {
    name: 'Batch 7',
    count: 97,
  };

  const result = await batches.addContactsToBatchGroup(contacts, group);

  t.deepEqual(result['7'], [1, 2, 3]);
  t.is(result['8'], undefined);
});

