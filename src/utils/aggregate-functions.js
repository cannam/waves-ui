/**
 * Created by lucas on 09/01/2017.
 */

export function summariseRowWise(tabular, aggregate) {
  return aggregate(tabular);
}

export function summariseColumnWise(tabular, aggregate) {
  return aggregate(transpose(tabular));
}

export function maxBinning(binWidth) {
  return bin(
    binWidth,
    (arr) => {
      let accumulator = arr[0] instanceof Float32Array ?
        new Float32Array(arr[0].length) : new Array(arr[0].length);
      return arr.reduce(
        (acc, val, i) => {
          acc[i] = Math.max(...val);
          return acc;
        },
        accumulator
      );
    }
  );
}

export function bin(binWidth, reducer = (val) => val) {
  return (tabular) => {
    if (binWidth < 1 || tabular.length < 1) return [];

    let bins = new Array((tabular.length / binWidth) | 0);

    for (let i = 0, len = tabular.length, count = 0; i < len; i += binWidth, ++count)
      bins[count] = reducer(tabular.slice(i, i + binWidth));
    return bins;
  };
}

function transpose(tabular) {
  const nCols = tabular.length;
  const nRows = tabular[0].length;

  let transposed = new Array(nRows);
  const Arr = tabular[0] instanceof Float32Array ?
    Float32Array : Array;

  for (let i = 0; i < nRows; ++i)
    transposed[i] = new Arr(nRows);

  for (let i = 0; i < nCols; ++i)
    for (let j = 0; j < nRows; ++j)
      transposed[j][i] = tabular[i][j];
  return transposed;
}