/**
 * Created by lucas on 09/01/2017.
 */
import {
  summariseRowWise,
  summariseColumnWise,
  maxBinning as max,
  bin
} from '../../src/utils/aggregate-functions';

const test = require('tape');


test('put tabular rows / cols into bins for summarising', (assert) => {
  const table = [
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 4]
  ];
  assert.deepEquals(
    bin(2)(table), [
      [[1, 1], [2, 2]],
      [[3, 3], [4, 4]]
    ],
    'Correctly bins the data for even bin width'
  );
  assert.deepEquals(
    bin(3)(table), [
      [[1, 1], [2, 2], [3, 3]],
      [[4, 4]]
    ],
    'Correctly bins the data for odd bin width'
  );
  assert.deepEquals(
    bin(1)(table),
    table.map(dim => [dim]),
    'Correctly bins for bin width of 1'
  );
  assert.deepEquals(
    bin(5)(table),
    [table],
    'Correctly bins for bin width larger than input'
  );
  assert.deepEquals(
    bin(4)(table),
    [table],
    'Correctly bins for bin width size of the input'
  );
  assert.deepEquals(
    bin(0)(table),
    [],
    'Returns empty array for bin width of zero'
  );
  const typedTable = table.map(dim => Float32Array.from(dim));
  assert.deepEquals(
    bin(4)(typedTable),
    [typedTable],
    'Correctly operates on Float32Array elements'
  );
  assert.end();
});

test('summarise one dimension of 2D array by peaks', (assert) => {
  const table = [
    [1, 2, 3, 4],
    [1, 2, 3, 4],
    [1, 2, 3, 4],
    [1, 2, 3, 4],
    [1, 2, 3, 4]
  ];
  const expectedColumnWise = [[1, 2, 3, 4]];
  const expectedRowWise = [[4, 4, 4, 4, 4]];
  assert.deepEquals(
    summariseColumnWise(table, max(5)),
    expectedColumnWise,
    'Correctly summarises by peaks in rows'
  );
  assert.deepEquals(
    summariseRowWise(table, max(5)),
    expectedRowWise,
    'Correctly summarises by peaks in columns'
  );
  const typedTable = table.map(dim => Float32Array.from(dim));
  assert.deepEquals(
    summariseColumnWise(typedTable, max(5)),
    expectedColumnWise,
    'Correctly summarises by peaks in Float32Array rows'
  );
  assert.end();
});
