// Support regenerator-runtime globally.
import "regenerator-runtime/runtime.js";

import Base64 from "./core/base64.js";
import Converter from "./core/converter.js";
import File from "./core/file.js";
import Image from "./core/image.js";
import Photo from "./core/photo.js";
import Rotate from "./core/rotate.js";

// Supported input formats
// image/png, image/jpeg, image/jpg, image/gif, image/bmp, image/tiff, image/x-icon,  image/svg+xml, image/webp, image/xxx
// image/png, image/jpeg, image/webp
export default class Compress {
  attach(el, options) {
    return new Promise((resolve) => {
      const input = document.querySelector(el);
      input.setAttribute("accept", "image/*");
      input.addEventListener(
        "change",
        (evt) => {
          const output = this.compress([...evt.target.files], options);
          resolve(output);
        },
        false
      );
    });
  }

  compress(files, options) {
    return Promise.all(files.map((file) => compressFile(file, options)));
  }

  static convertBase64ToFile(base64, mime) {
    return Converter.base64ToFile(base64, mime);
  }
}

function loopCompression(
  canvas,
  size,
  quality = 1,
  targetSize,
  targetQuality = 1,
  iterations = 1
) {
  const base64str = Converter.canvasToBase64(canvas, quality);
  const newSize = Base64.size(base64str);

  return newSize > targetSize || quality > targetQuality
    ? loopCompression(
        canvas,
        newSize,
        quality - 0.1,
        targetSize,
        targetQuality,
        iterations + 1
      )
    : base64str;
}

async function compressFile(file, options) {
  // Create a new photo object
  const photo = new Photo(options);
  photo.start = window.performance.now();
  photo.alt = file.name;
  photo.ext = file.type;
  photo.startSize = file.size;
  photo.orientation = photo.rotate ? await Rotate.orientation(file) : 0;

  return compressImage(photo)(await File.load(file));
}

function compressImage(photo) {
  return async (src) => {
    const img = await Image.load(src);
    // Store the initial dimensions
    photo.startWidth = img.naturalWidth;
    photo.startHeight = img.naturalHeight;

    // Resize the image
    if (photo.resize) {
      const { width, height } = Image.resize(photo.maxWidth, photo.maxHeight)(
        img.naturalWidth,
        img.naturalHeight
      );
      photo.endWidth = width;
      photo.endHeight = height;
    } else {
      photo.endWidth = img.naturalWidth;
      photo.endHeight = img.naturalHeight;
    }

    const canvas = Converter.imageToCanvas(
      photo.endWidth,
      photo.endHeight,
      photo.orientation
    )(img);

    photo.iterations = 1;
    photo.base64prefix = Base64.prefix(photo.ext);

    const base64 = await loopCompression(
      canvas,
      photo.startSize,
      photo.quality,
      photo.size,
      photo.minQuality,
      photo.iterations
    );

    photo.finalSize = Base64.size(base64);
    photo.end = window.performance.now();
    const difference = photo.end - photo.start; // in ms

    return {
      data: Base64.data(base64),
      prefix: photo.base64prefix,
      elapsedTimeInSeconds: difference / 1000, // in seconds
      alt: photo.alt,
      initialSizeInMb: Converter.size(photo.startSize).MB,
      endSizeInMb: Converter.size(photo.finalSize).MB,
      ext: photo.ext,
      quality: photo.quality,
      endWidthInPx: photo.endWidth,
      endHeightInPx: photo.endHeight,
      initialWidthInPx: photo.startWidth,
      initialHeightInPx: photo.startHeight,
      sizeReducedInPercent:
        ((photo.startSize - photo.finalSize) / photo.startSize) * 100,
      iterations: photo.iterations,
    };
  };
}
