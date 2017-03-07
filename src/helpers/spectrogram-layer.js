/**
 * Created by lucast on 05/01/2017.
 */

import Layer from '../core/layer';
import Spectrogram from '../shapes/spectrogram-shape';

export default class SpectrogramLayer extends Layer {
  constructor(featureList, stepDuration, options) {
    options = Object.assign(
      {},
      {/* TODO defaults */},
      options
    );

    // TODO entity? what are the other options
    super('entity', featureList, options);

    this.configureShape(
      Spectrogram,
      {}, // accessors
      {
        stepDuration: stepDuration,
        opacity: options.opacity
      } // TODO options to pass to shape
    );
  }
}