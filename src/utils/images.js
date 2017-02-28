/**
 * Created by lucas on 12/01/2017.
 */

export class Colour {
  constructor(r, g, b, a = 255) {
    this.data = Uint8ClampedArray.of(r, g, b, a);
  }

  get r() {
    return this.data[0];
  }

  get g() {
    return this.data[1];
  }

  get b() {
    return this.data[2];
  }

  get a() {
    return this.data[3];
  }

  static fromHex(hex) {
    try {
      if (hex.length !== 4 && hex.length !== 7) throw '';

      const isShorthandForm = hex.length === 4;

      const toRgb = (str) => {
          let triplets = new Array(3);
          for (let i = 0; i < 3; ++i)
            triplets[i] = parseInt(`0x${
              isShorthandForm ? str[i].repeat(2) : str.substr(i * 2, 2)}`);
          return triplets;
        };

      const rgb = toRgb(hex.substring(1));

      if (rgb.filter(val => val === val).length !== rgb.length) throw '';
      return new Colour(...rgb);
    } catch (e) {
      throw new TypeError("Invalid colour hex string provided.");
    }
  }
}

export class ColourImage {
  constructor(width, height, data = undefined) {
    this.width = width;
    this.height = height;
    this.data = data instanceof Uint8ClampedArray ?
      data : new Uint8ClampedArray(width * height * 4);
  }

  setPixel(x, y, colour) {
    this.data.set(colour.data, 4 * (y * this.width + x));
  }

  getPixel(x, y) {
    return new Colour(...this.data[4 * (y * this.width + x)]);
  }
}