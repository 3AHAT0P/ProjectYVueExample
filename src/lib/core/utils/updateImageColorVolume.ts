export default (imageData: ImageData) => {
  const pixels = imageData.data;
  for (let i = 0; i < pixels.length; i += 4) {
    // red is pixels[i];
    // green is pixels[i + 1];
    // blue is pixels[i + 2];
    // alpha is pixels[i + 3];
    // all values are integers between 0 and 255
    // do with them whatever you like. Here we are reducing the color volume to 98%
    // without affecting the alpha channel
    pixels[i] *= 0.95;
    pixels[i + 1] *= 0.85;
    pixels[i + 2] *= 0.85;
  }
  return imageData;
};
