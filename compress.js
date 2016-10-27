// Converts image to canvas; returns new canvas element


// Compress Images Loaded
// Compress URL Images
// Crop image
// Preload

// static methods
// utilities -> resize based on aspect ratio
// calculate image file size

// 0. Set Compresser Options

// const BaseCompress = new Compress().init({
// 	maxSizeInMB: 2,
// 	maxQuality: .75
// });
//
// BaseCompress.on('start', (evt) => {
// 	// handle start
// });
//
// BaseCompress.on('progress', (file) => {
//
// 	// every files processed will be here
// });
//
// BaseCompress.on('end', (files) => {
// 	// [...] array of compressed images
// });

// 1. Read Files

/*
 * The facade of the compression logic
**/

function toArrayImage(files) {
  // Better, but poor compatibility
  // return [...files]
  let f = []
  for (const file of files) {
    console.log(file)
    f.push(file)
  }
  return f;
}

window.compress = compress;


function compress (evt) {
	// start with one file first, don't be too adventurous
	const files = evt.target.files;

	const file = files[0];

  // Options
  // excludeRaw? true will improve performance


  let d = []
  // parallel
  toArrayImage(files).forEach((file) => {
    let startTime = null;
    let endTime = null;
    // change file name to alt
    const name = file.name;
    const ext = file.type;
    const size = file.size;
    console.log('size:', size)
    let finalWidth = null;
    let finalHeight = null;
    const minQuality = .65;
    const maxQuality = 1;
    const targetQuality = 1;
    const targetSize = .5 * 1024 * 1024; // mb

    console.log('targetSze:', targetSize)
    const qualityDrop = .05; // the quality will degrade by 0.25 each time
    const minSize = '2mb';
    const quality = 1;
    let finalSize = 0;
    let iterations = 0;
    
    startTime = performance.now();

    read(file)
    .then(loadImage)
    .then((img) => {
      width = img.naturalWidth;
      height = img.naturalHeight;
      const { width:targetWidth, height:targetHeight } = resize(1080, null)(img);
      finalWidth = targetWidth;
      finalHeight = targetHeight;
      return convertImageToCanvas(finalWidth, finalHeight)(img);
    })
    //.then(initCanvas)
    //c.then(convertImageToCanvas)
    .then((src) => {
      /*
       *  Will compress the image and alsop convert to base 64
      **/
      // the first iteration
      iterations = 1;
      return loopCompression(src, size, quality, targetSize, targetQuality, iterations); 
    })
    .then((base64) => {
      finalSize = getFileSize(base64);
      return stripData(base64);
    })
    .then((data) => {
      endTime = performance.now();
      const difference = endTime - startTime; // in ms
      console.log('completed')
      d.push({
        data: data,
        timeElapsedSeconds: difference / 1000,
        name: name,
        size: size,
        sizeMB: size / (1000 * 1000),
        finalSize: finalSize,
        finalSizeMB: finalSize / (1000 * 1000),
        ext: ext,
        finalWidth: finalWidth,
        finalHeight: finalHeight,
        width: width,
        height: height,
        sizeReduced: (size - finalSize) / size * 100,
        iterationCount: iterations
      });
    }).then((data) => {
      // the sequence won't be respected
      // first come first load
      console.log(d)
    });
  });

  // series

  // let d = []
  // toArrayImage(files).reduce((p, file) => {
  //   let startTime = null;
  //   let endTime = null;
  //   const name = file.name;
  //   const ext = file.type;
  //   const size = file.size;
  //   let finalWidth = null;
  //   let finalHeight = null;

  //   return p.then(() => {
  //     startTime = performance.now();
  //     return read(file)
  //   })
  // 	.then(loadImage)
  //   .then((img) => {
  //     const { width, height } = resize(1080, null)(img);
  //     finalWidth = width;
  //     finalHeight = height;
  //     return convertImageToCanvas(width, height)(img);
  //   })
  //   //.then(initCanvas)
  //   //c.then(convertImageToCanvas)
  //   .then(convertCanvasToImage)
  //   .then((data) => {
  //     endTime = performance.now();
  //     const difference = endTime - startTime; // in ms

  //     d.push([data, difference / 1000]);
  //   });
  // }, Promise.resolve({})).then((output) => {
  //   console.log(d)
  // }).catch((err) => {
  //   console.log(err);
  // })



  const endTime = performance.now();
  const finalSize = 0;
  const isCompressed = false;
  //const compressionRatio = (size - finalSize) / size * 100;
  const raw = null; // original raw image
  const finalWidth = null;
  const finalHeight = null;
  const aspectRatio = null;

}

/*
 * returns a new canvas object
**/
function initCanvas({ width, height }) {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
	return canvas;
}

function read(file) {

	return new Promise((resolve, reject) => {
		const fileReader = new FileReader();

		fileReader.addEventListener('load', function (e) {
      const fileSize = getFileSize(e.target.result);
      console.log(fileSize)
			resolve(e.target.result);
		  }, false);

		fileReader.addEventListener('error', (err) => {
			reject(err)
		})

		fileReader.readAsDataURL(file);
	})

}

function timer() {
	const start = performance.now();
}
function loadImage(src) {

	return new Promise((resolve, reject) => {

		const img = new Image();

		img.addEventListener('load', () => {
      console.log(' * loadImage')
			// get file name
			// get file size
			resolve(img);
		}, false);

		img.addEventListener('error', (err) => {
			reject(err);
		}, false);
		img.src = src;

	})
}

function convertImageToCanvas(width, height) {
	var canvas = document.createElement("canvas");

  return function (image) {
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas;
  }

}

function convertCanvasToBase64(canvas) {
  const quality = .5;
  // in order to compress the final image format has to be jpeg
  const base64str = canvas.toDataURL("image/jpeg", quality);
  return base64str;

}


// Converts canvas to an image
function convertCanvasToImage(canvas) {
	var image = new Image();
  const quality = .5;
  // in order to compress the final image format has to be jpeg
  const base64str = canvas.toDataURL("image/jpeg", quality);
	image.src = base64str;
  console.log(getFileSize(base64str))
	return image;
}


function handleFiles(evt) {
  const files = evt.target.files;


  const validImageFiles = [...files].filter(filterImage);


}

function filterImage(file) {

 if (!file.type.match("image.*")) return;
  const validType = ["image/gif", "image/jpeg", "image/png"];
  return validType.indexOf(file.type);
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

function getImageBasedOnQuality() {
	var fullQuality = canvas.toDataURL("image/jpeg", 1.0);
	// data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...9oADAMBAAIRAxEAPwD/AD/6AP/Z"
	var mediumQuality = canvas.toDataURL("image/jpeg", 0.5);
	var lowQuality = canvas.toDataURL("image/jpeg", 0.1);
}


function resize(targetWidth, targetHeight) {

  return function (img) {
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const aspectRatio = width / height;

    console.log("width, hieght", width, height)

    // can you enlarge the image? no
    if (!targetWidth && !targetHeight) return img;

    const outputWidth = Math.min(width, targetWidth);
    const outputHeight = Math.min(height, targetHeight);
    if (outputWidth) {
      // if target width is provided, it will resize based on aspect ratio,
      const scaleWidth = width / outputWidth;
      console.log('scaleWidth', scaleWidth)
      const h = height / scaleWidth;
      console.log(outputWidth, h);
      return { width: outputWidth, height: h }
    } else {
      const scaleHeight = height / outputHeight;
      const w = width / scaleHeight;
      console.log(scaleWidth, h);
      return { width: w, height: outputHeight }

    }

    // if target height is provied, it will also resize to height based on aspect ration

    // if both is provided, it will only resize based on target width, unfortunaly it can't crop the image yet



  }

}

function loopCompression(src, size, quality=1, targetSize, targetQuality=1, iterations) {


  const base64str = convertCanvasToBase64(src)
  const newSize = getFileSize(base64str);
  // const base64str = convertCanvasToBase64(src)
  // const size = getFileSize(base64str);
  console.log('looops', size, quality)
  iterations += 1;
  // add in iteration count

  if (newSize > targetSize) {
    return loopCompression(src, newSize, quality - .1, targetQuality, targetSize, iterations);
  }

  if (quality > targetQuality) {
    return loopCompression(src, newSize, quality - .1, targetQuality, targetSize, iterations);
  }

  if (quality < .5) {
    return base64str;
  }
  return base64str;
}

function fileSizeFormatter(size) {
  return {
    b: size,
    kb: size / 1000,
    mb: size / (1000 * 1000)
  }
}

function getFileSize(base64str) {
	//L * 3 / 4 - p
var base64len = base64str.replace(/^data:image\/\w+;base64,/, "").length;
	var size = base64len * 3 / 4;
  return size;
}

function getExtension() {
	var ext = img.split(';')[0].match(/jpeg|png|gif/)[0];
// strip off the data: url prefix to get just the base64-encoded bytes
  var data = img.replace(/^data:image\/\w+;base64,/, "");
}

function stripData(data) {
  return data.replace(/^data:image\/\w+;base64,/, "");
}
