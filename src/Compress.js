const Compress = (function() {

  function attach (el, options) {
    return new Promise((resolve, reject) => {
      const input = document.querySelector(el)
      input.setAttribute('accept', 'image/*')
      input.addEventListener('change', (evt) => {
        const output = compressFiles([...evt.target.files], options)
        resolve(output)
      }, false)
    })
  }
  function compressImage (photo) {
    return (src) => {
      return loadImage(src).then((img) => {
        // Store the initial dimensions
        photo.startWidth = img.naturalWidth
        photo.startHeight = img.naturalHeight
        // Resize the image
        if (photo.resize) {
          const { width, height } = resize(photo.maxWidth, photo.maxHeight)(img)
          photo.endWidth = width
          photo.endHeight = height
        } else {
          photo.endWidth = img.naturalWidth
          photo.endHeight = img.naturalHeight
        }
        return convertImageToCanvas(photo.endWidth, photo.endHeight)(img)
      })
      .then((canvas) => {
        photo.iterations = 1
        photo.base64prefix = getStrip(getExtension(convertCanvasToBase64(canvas)))
        return loopCompression(canvas, photo.startSize, photo.quality, photo.size, photo.minQuality, photo.iterations)
      })
      .then((base64) => {
        photo.finalSize = getFileSize(base64);
        return stripData(base64);
      })
      .then((data) => {
        photo.end = performance.now();
        const difference = photo.end - photo.start; // in ms

        return {
          data: data,
          timeElapsedInSeconds: difference / 1000, // in seconds
          alt: photo.alt,
          startSizeInMB: sizeConverter(photo.startSize).MB,
          base64prefix: photo.base64prefix,
          finalSizeInMB: sizeConverter(photo.finalSize).MB,
          ext: photo.ext,
          quality: photo.quality,
          endWidthInPX: photo.endWidth,
          endHeightInPX: photo.endHeight,
          startWidthInPX: photo.startWidth,
          startHeightInPX: photo.startHeight,
          sizeReducedInPercent: (photo.startSize - photo.finalSize) / photo.startSize * 100,
          iterations: photo.iterations
        }
      })
    }
  }
  /*
   * Compress a single image file into base64 string with reduced size
  **/
  function compressFile (file, options) {
    // Create a new photo object
    const photo = new Photo(options)
    photo.start = performance.now()
    photo.alt = file.name
    photo.ext = file.type
    photo.startSize = file.size

    return read(file).then(compressImage(photo))
  }

  function compressFiles (files, options) {
    return Promise.all(files.map((file) => {
      return compressFile(file, options)
    }))
  }

  /*
   * returns a new canvas object
  **/
  function initCanvas({ width, height }) {
    const canvas = document.createElement('canvas');
    // const context = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  /*
   * Read a file that is loaded from <input type='file'/>
  **/
  function read(file) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.addEventListener('load', (evt) =>  {
        resolve(evt.target.result)
      }, false)

      fileReader.addEventListener('error', (err) => {
        reject(err)
      });

      fileReader.readAsDataURL(file)
    });
  }

  /*
   * Convert a file to an Image
  **/
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.addEventListener('load', () => {
        resolve(img)
      }, false)

      img.addEventListener('error', (err) => {
        reject(err)
      }, false)

      img.src = src
    });
  }

  function convertImageToCanvas(width, height) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext('2d')
    return (image) => {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas;
    }

  }

  function convertCanvasToBase64(canvas) {
    const quality = .5;
    // in order to compress the final image format has to be jpeg
    const base64str = canvas.toDataURL('image/jpeg', quality);
    return base64str;
  }


  // Converts canvas to an image
  function convertCanvasToImage(canvas) {
    var image = new Image();
    const quality = .5;
    // in order to compress the final image format has to be jpeg
    const base64str = canvas.toDataURL('image/jpeg', quality);
    image.src = base64str;

    return image;
  }


  function handleFiles(evt) {
    const files = evt.target.files
    const validImageFiles = [...files].filter(filterImage)
  }

  function filterImage(file) {
    return file.type.match("image.*");
   // if (!file.type.match("image.*")) return;
   //  const validType = ["image/gif", "image/jpeg", "image/png"];
   //  return validType.indexOf(file.type);
  }

  function previewFile() {
    var preview = document.querySelector('img');
    var file    = document.querySelector('input[type=file]').files[0];
    var reader  = new FileReader();

    reader.addEventListener("load", function () {
      preview.src = reader.result;
    }, false);

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  // function getImageBasedOnQuality() {
  //   var fullQuality = canvas.toDataURL("image/jpeg", 1.0);
  //   // data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...9oADAMBAAIRAxEAPwD/AD/6AP/Z"
  //   var mediumQuality = canvas.toDataURL("image/jpeg", 0.5);
  //   var lowQuality = canvas.toDataURL("image/jpeg", 0.1);
  // }

  /*
   * Resize the image based on the given height or width boundary.
   * Auto resize based on aspect ratio. 
  **/

  function resize(targetWidth, targetHeight) {
    return (img) => {

      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const aspectRatio = width / height;

      // can you enlarge the image? no
      if (!targetWidth && !targetHeight) return { width, height };

      const outputWidth = Math.min(width, targetWidth);
      const outputHeight = Math.min(height, targetHeight);

      if (outputWidth) {
        
        const scaleWidth = width / outputWidth;
        const h = height / scaleWidth;

        return { width: outputWidth, height: h }
      } else {

        const scaleHeight = height / outputHeight;
        const w = width / scaleHeight;

        return { width: w, height: outputHeight }
      }
    }
  }

  function loopCompression(canvas, size, quality=1, targetSize, targetQuality=1, iterations) {
    const base64str = convertCanvasToBase64(canvas)
    const newSize = getFileSize(base64str);
    // const base64str = convertCanvasToBase64(src)
    // const size = getFileSize(base64str);
    iterations += 1;
    // add in iteration count

    if (newSize > targetSize) {
      return loopCompression(canvas, newSize, quality - .1, targetQuality, targetSize, iterations);
    }

    if (quality > targetQuality) {
      return loopCompression(canvas, newSize, quality - .1, targetQuality, targetSize, iterations);
    }

    if (quality < .5) {
      return base64str;
    }
    return base64str;
  }

  function sizeConverter(size) {
    return {
      KB: size / 1000,
      MB: size / (1000 * 1000)
    }
  }

  function getFileSize(base64str) {
    //L * 3 / 4 - p
    var base64len = base64str.replace(/^data:image\/\w+;base64,/, "").length;
    var size = base64len * 3 / 4;
    return size;
  }

  function getExtension(base64) {
    const ext = base64.split(';')[0].match(/jpeg|png|gif/)[0];
    // strip off the data: url prefix to get just the base64-encoded bytes
    //var data = img.replace(/^data:image\/\w+;base64,/, "");
    return ext;
  }

  function stripData(data) {
    return data.replace(/^data:image\/\w+;base64,/, "");
  }

  function getStrip(ext) {
    return `data:${ext};base64,`
  }

  // function loadImageFromURL (url, placeholder) {
  //   const image = new Image()

  //   image.crossOrigin = 'Anonymous';
  //   image.onload = () => {

  //   }
  //   image.onerror = () => {

  //   }

  //   image.src = url
  // }

  return {
    compress: compressFiles,
    // URL: '',
    attach: attach
  }
})

// The photo model
class Photo {
  constructor (props) {
    this.start = performance.now()
    this.end = null

    this.alt = null
    this.ext = null
    this.startSize = null
    this.startWidth = null
    this.startHeight = null
    this.quality = props && props.quality ? Math.abs(props.quality) : .75
    // How much will the quality decrease by each compression
    this.stepQuality = .5

    // size in MB
    this.size = props && props.size ? props.size * 1000 * 1000 : 2 * 1000 * 1000
    this.endSize = null
    this.endWidth = null
    this.endHeight = null
    this.iterations = 0
    this.base64prefix = null
    // Carry out image resizing
    this.resize = true
    this.maxWidth = 1920
    this.maxHeight = 1920
  }
}
// Supported input formats
// image/png, image/jpeg, image/jpg, image/gif, image/bmp, image/tiff, image/x-icon,  image/svg+xml, image/webp, image/xxx
// image/png, image/jpeg, image/webp
module.exports = Compress;