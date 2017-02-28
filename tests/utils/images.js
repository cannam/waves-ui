/**
 * Created by lucas on 12/01/2017.
 */
import {Colour, ColourImage} from '../../src/utils/images';

const test = require('tape');

test('can construct a Colour object from a hex code', assert => {
  assert.deepEquals(
    Colour.fromHex('#000'),
    new Colour(0, 0, 0),
    'Constructs from shorthand'
  );
  assert.deepEquals(
    Colour.fromHex('#FFFFFF'),
    new Colour(255, 255, 255),
    'Constructs from full hex code'
  );
  assert.deepEquals(
    Colour.fromHex('#f80046'),
    new Colour(248, 0, 70),
    'Constructs from real world hex colour'
  );
  assert.throws(
    () => Colour.fromHex('#NotHex'),
    TypeError,
    'Throws on construction from string with invalid characters'
  );
  assert.throws(
    () => Colour.fromHex('#FF'),
    TypeError,
    'Throws on construction too short string'
  );
  assert.throws(
    () => Colour.fromHex('#FFFFFFFF'),
    TypeError,
    'Throws on construction too long string'
  );
  assert.throws(
    () => Colour.fromHex(123),
    TypeError,
    'Throws on construction if param is not a string'
  );
  assert.throws(
    () => Colour.fromHex([1,2,3,4,5,6]),
    TypeError,
    'Throws on construction if param is not a string'
  );
  assert.end();
});

test('can create a pixel map in the form used by ImageData', assert => {
  const colourMap = [
    [[0, 0, 0], [255, 255, 255]],
    [[255, 0, 0], [0, 255, 0]],
    [[0, 0, 255], [255, 255, 0]],
    [[0, 255, 255], [255, 0, 255]]
  ];
  const expectedPixelData = Uint8ClampedArray.of(...colourMap.
    reduce((acc, arr) => acc.concat(...arr.
      reduce((acc, arr) => acc.concat(...arr, 255), [])
    ), [])
  );
  const testImage = new ColourImage(2, 4);
  for (let y = 0; y < 4; ++y)
    for (let x = 0; x < 2; ++x)
      testImage.setPixel(x, y, new Colour(...colourMap[y][x]));
  assert.equals(testImage.data.length, expectedPixelData.length);
  assert.deepEquals(
    testImage.data,
    expectedPixelData,
    'Lays out pixels in the backing array properly'
  );
  assert.end();
});

