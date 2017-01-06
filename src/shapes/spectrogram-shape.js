/**
 * Created by lucast on 04/01/2017.
 */
import BaseShape from './base-shape';

const xhtmlNS = 'http://www.w3.org/1999/xhtml';

export default class Spectrogram extends BaseShape {
  getClassName() {
    return 'spectrogram';
  }

  // TODO determine suitable implementations for _getAccessorList and _getDefaults

  render(renderingCtx) {
    // TODO this is pasted straight from the commented out Canvas code in waveform.js, refactor
    // TODO canvas also doesn't work properly when embedded in an SVG element - so this all needs to go anyway
    this.$el = document.createElementNS(this.ns, 'foreignObject');
    this.$el.setAttributeNS('', 'width', renderingCtx.width);
    this.$el.setAttributeNS('', 'height', renderingCtx.height);

    const canvas = document.createElementNS(xhtmlNS, 'xhtml:canvas');

    this._ctx = canvas.getContext('2d');
    this._ctx.canvas.width = renderingCtx.width;
    this._ctx.canvas.height = renderingCtx.height;

    this.$el.appendChild(canvas);
    return this.$el;

  }

  update(renderingCtx, datum) {
    for (let bins of datum) {
      Spectrogram.drawSpectrogramColumn(bins, this._ctx);
    }
  }

  static drawSpectrogramColumn(bins, ctx) {
    const minDecibels = -100;
    const maxDecibels = -30;
    const rangeScaleFactor = 1.0 / (maxDecibels - minDecibels);
    const nBins = bins.length;
    const normalisationFactor = 1 / nBins;

    for (let [i, binValue] of bins.entries()) {
      // scale
      const value = binValue * normalisationFactor;
      // re-map range
      const dbMag = (isFinite(value) && value > 0.0) ? 20.0 * Math.log10(value) : minDecibels;
      let scaledValue = 255 * (dbMag - minDecibels) * rangeScaleFactor;
      // clip to uint8 range
      if (scaledValue < 0)
        scaledValue = 0;
      if (scaledValue > 255)
        scaledValue = 255;
      scaledValue = Math.floor(scaledValue);
      // draw line
      ctx.fillStyle = 'rgb(c, c, c)'.replace(/c/g, `${255 - scaledValue}`);
      ctx.fillRect(0, nBins - i - 1, 1, 1);
    }
    ctx.translate(1, 0);
  }
}