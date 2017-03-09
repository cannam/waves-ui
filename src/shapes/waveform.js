import BaseShape from './base-shape';


const xhtmlNS = 'http://www.w3.org/1999/xhtml';

/**
 * A shape to display a waveform. (for entity data)
 *
 * [example usage](./examples/layer-waveform.html)
 *
 * @todo - fix problems with canvas strategy.
 */
export default class Waveform extends BaseShape {
  getClassName() { return 'waveform'; }

  _getAccessorList() {
    // return { y: 0 };
    return {};
  }

  _getDefaults() {
    return {
      sampleRate: 44100,
      color: '#000000',
      opacity: 1,
    };
  }

  render(renderingContext) {
    if (this.$el) { return this.$el; }

    this.$el = document.createElementNS(this.ns, 'path');
    this.$el.setAttributeNS(null, 'fill', 'none');
    this.$el.setAttributeNS(null, 'shape-rendering', 'crispEdges');
    this.$el.setAttributeNS(null, 'stroke', this.params.color);
    this.$el.style.opacity = this.params.opacity;

    return this.$el;
  }

  encache(datum) {

    console.log("cache called");

    // The cache is an array of peak caches (holding the min and max
    // values within each block for a given block size) with each peak
    // cache represented as an object with blockSize, min array, and
    // max array properties.
    //
    // For example:
    //    
    // [ {
    //     blockSize: 16,
    //     max: [ 0.7,  0.5, 0.25, -0.1 ],
    //     min: [ 0.5, -0.1, -0.8, -0.2 ]
    //   }, {
    //     blockSize: 32, 
    //     max: [  0.7,  0.25 ],
    //     min: [ -0.1, -0.8  ]
    //   }
    // ]
    //
    // As it happens we are only creating a cache with a single block
    // size at the moment, but it's useful to record that block size
    // in the cache rather than have to fix it here in the shape.

    const before = performance.now();

    const peakCacheFor = ((arr, blockSize) => {
    
      let peaks = [], troughs = [];

      const len = arr.length;
    
      for (let i = 0; i < len; i = i + blockSize) {
        let min = arr[i];
        let max = arr[i];
        for (let j = 0; j < blockSize; j++) {
          let sample = arr[i + j];
          if (sample < min) { min = sample; }
          if (sample > max) { max = sample; }
        }
        peaks.push(max);
        troughs.push(min);
      }

      return [ peaks, troughs ];
    });

    // For a single peak cache, experiment suggests smallish block
    // sizes are better. There's no benefit in having multiple layers
    // of cache (e.g. 32 and 512) unless update() can take advantage
    // of both in a single summarise action (e.g. when asked for a
    // read from 310 to 1050, start by reading single samples from 310
    // to 320, then from the 32-sample cache from 320 to 512, then
    // switch to the 512 sample cache, rather than having to read
    // single samples all the way from 310 to 512)... but at the
    // moment it can't. And the more complex logic would carry its own
    // overhead.
    
    const blockSize = 32;
    let [ peaks, troughs ] = peakCacheFor(datum, blockSize);
    
    return [
      { blockSize: blockSize,
        max: peaks,
        min: troughs
      }
    ];
  }
  
  summarise(datum, minX, maxX, pixelToSample, cache) {

    const before = performance.now();

    const px0 = Math.floor(minX);
    const px1 = Math.floor(maxX);
    let peakCache = null;
    let peakCacheBlockSize = 0;

    if (cache && (cache.length > 0)) {

      // Find a suitable peak cache if we have one.
      
      // "step" is the distance in samples from one pixel to the next.
      // We want the largest cache whose block size is no larger than
      // half this, so as to avoid situations where our step is always
      // straddling cache block boundaries.
      const step = pixelToSample(px0 + 1) - pixelToSample(px0);

      for (var i = 0; i < cache.length; ++i) {
        const blockSize = cache[i].blockSize;
        if (blockSize > peakCacheBlockSize && blockSize <= step/2) {
          peakCache = cache[i];
          peakCacheBlockSize = peakCache.blockSize;
        }
      }
    }

    const sampleRate = this.params.sampleRate;
    let minMax = [];

    for (let px = px0; px < px1; px++) {

      const startSample = pixelToSample(px);
      if (startSample >= datum.length) break;

      let endSample = pixelToSample(px + 1);
      if (endSample >= datum.length) endSample = datum.length;
      
      let min = datum[startSample];
      let max = min;
      
      let ix = startSample;

      if (peakCache && (peakCacheBlockSize > 0)) {
      
        while (ix < endSample && (ix % peakCacheBlockSize) !== 0) {
          let sample = datum[ix];
          if (sample < min) { min = sample; }
          if (sample > max) { max = sample; }
          ++ix;
        }

        let cacheIx = ix / peakCacheBlockSize;
        const cacheMax = peakCache.max;
        const cacheMin = peakCache.min;
      
        while (ix + peakCacheBlockSize <= endSample) {
          if (cacheMax[cacheIx] > max) max = cacheMax[cacheIx];
          if (cacheMin[cacheIx] < min) min = cacheMin[cacheIx];
          ++cacheIx;
          ix = ix + peakCacheBlockSize;
        }
      }

      while (ix < endSample) {
        let sample = datum[ix];
        if (sample < min) { min = sample; }
        if (sample > max) { max = sample; }
        ++ix;
      }

      minMax.push([px, min, max]);
    }

    const after = performance.now();
    console.log("waveform summarisation time = " + Math.round(after - before));
    
    return minMax;
  }

  update(renderingContext, datum, cache) {

    const before = performance.now();

    // define nbr of samples per pixels

    const nbrSamples = datum.length;
    const duration = nbrSamples / this.params.sampleRate;
    const width = renderingContext.timeToPixel(duration);
    const samplesPerPixel = nbrSamples / width;

    if (!samplesPerPixel || datum.length < samplesPerPixel) { return; }

    // compute/draw visible area only
    // @TODO refactor this ununderstandable mess
    let minX = Math.max(-renderingContext.offsetX, 0);
    let trackDecay = renderingContext.trackOffsetX + renderingContext.startX;
    if (trackDecay < 0) { minX = -trackDecay; }

    let maxX = minX;
    maxX += (renderingContext.width - minX < renderingContext.visibleWidth) ?
      renderingContext.width : renderingContext.visibleWidth;

    const sampleRate = this.params.sampleRate;
    const pixelToSample = (pixel => {
      return Math.floor (sampleRate * renderingContext.timeToPixel.invert(pixel));
    });

    // get min/max per pixels, clamped to the visible area
    const minMax = this.summarise(datum, minX, maxX, pixelToSample, cache);
    if (!minMax.length) { return; }

    const PIXEL = 0;
    const MIN   = 1;
    const MAX   = 2;
    const ZERO  = renderingContext.valueToPixel(0);

    let instructions = minMax.map((datum, index) => {
      const x  = datum[PIXEL];
      let y1 = Math.round(renderingContext.valueToPixel(datum[MIN]));
      let y2 = Math.round(renderingContext.valueToPixel(datum[MAX]));
      return `${x},${y1}L${x},${y2}`;
    });

    const d = 'M' + instructions.join('L');
    this.$el.setAttributeNS(null, 'd', d);

    const after = performance.now();
    console.log("waveform update time = " + Math.round(after - before));
  }
}
