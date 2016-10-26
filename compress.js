// Converts image to canvas; returns new canvas element


// Compress Images Loaded
// Compress URL Images

// 0. Set Compresser Options

const BaseCompress = new Compress().init({
	maxSizeInMB: 2, 
	maxQuality: .75
});

BaseCompress.on('start', (evt) => {
	// handle start
});

BaseCompress.on('progress', (file) => {
	
	// every files processed will be here
});

BaseCompress.on('end', (files) => {
	// [...] array of compressed images
});

// 1. Read Files
const Loader = document.getElementById("Loader");
Loader.addEventListener("change", BaseCompress.compress, false);

/*
 * The facade of the compression logic
**/
function* compress () {
	// start with one file first, don't be too adventurous
	const files = evt.target.files;
	
	const file = files[0];
	
	readFile(file)
	.then(loadImage)
	.then(
	
	
}

/*
 * returns a new canvas object
**/
function initCanvas() {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	return { canvas, context };
}

function readFile(file) {
	
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader();

		fileReader.addEventListener('load', function () {
		
			resolve(fileReader.result);
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
			
			// get file name
			// get file size
			resolve(img.src);
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
	image.src = canvas.toDataURL("image/png");
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


function getFileSize() {
	//L * 3 / 4 - p
var base64len = img.replace(/^data:image\/\w+;base64,/, "").length;
	var size = base64len * 3 / 4;
}

function getExtension() {
	var ext = img.split(';')[0].match(/jpeg|png|gif/)[0];
// strip off the data: url prefix to get just the base64-encoded bytes
var data = img.replace(/^data:image\/\w+;base64,/, "");
}
