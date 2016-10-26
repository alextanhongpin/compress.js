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
const Loader = document.getElementById("upload");
Loader.addEventListener("change", compress, false);

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
function compress (evt) {
	// start with one file first, don't be too adventurous
	const files = evt.target.files;

	const file = files[0];

  // Options
  // excludeRaw? true will improve performance

  const name = file.name;
  const ext = file.type;
  const size = file.size;


  let d = []
  toArrayImage(files).reduce((p, file) => {
    let startTime = null;
    let endTime = null;
    return p.then(() => {
      startTime = performance.now();
      return read(file)
    })
  	.then(loadImage)
    .then(convertImageToCanvas)
    .then(convertCanvasToImage)
    .then(resize(1080, null))
    .then((data) => {
      endTime = performance.now();
      const difference = endTime - startTime; // in ms

      d.push([data, difference / 1000]);
    })
  }, Promise.resolve({})).then((output) => {
    console.log(d)
  }).catch((err) => {
    console.log(err);
  })



  const endTime = performance.now();
  const finalSize = 0;
  const isCompressed = false;
  const compressionRatio = (size - finalSize) / size * 100;
  const raw = null; // original raw image
  const finalWidth = null;
  const finalHeight = null;
  const aspectRatio = null;

}

/*
 * returns a new canvas object
**/
function initCanvas() {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	return { canvas, context };
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

function convertImageToCanvas(image) {
	var canvas = document.createElement("canvas");

	canvas.width = image.width;
	canvas.height = image.height;
	canvas.getContext("2d").drawImage(image, 0, 0);

	return canvas;
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
    } else {
      const scaleHeight = height / outputHeight;
      const w = width / scaleHeight;
      console.log(scaleWidth, h);
    }

    // if target height is provied, it will also resize to height based on aspect ration

    // if both is provided, it will only resize based on target width, unfortunaly it can't crop the image yet


    return img;
  }

}

function loopCompression(src, size, quality, targetSize, targetQuality) {

  if (size > targetSize) {
    return loopCompression(src, size, quality - .1);
  }

  if (size > targetQuality) {
    return loopCompression(src, size, quality - .1);
  }
  return src;
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
