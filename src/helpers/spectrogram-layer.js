/**
 * Created by lucast on 05/01/2017.
 */

import Layer from '../core/Layer';
import Spectrogram from '../shapes/spectrogram-shape';

export default class SpectrogramLayer extends Layer {
  constructor(featureList, options) {
    options = Object.assign({}, {/* TODO defaults */}, options);

    // TODO entity? what are the other options
    super('entity', featureList, options);

    this.configureShape(
      Spectrogram,
      {}, // accessors
      {} // TODO options to pass to shape
    );
  }
}