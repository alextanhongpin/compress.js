<!-- [![Build Status](https://travis-ci.org/alextanhongpin/compress.js.svg?branch=master)](https://travis-ci.org/alextanhongpin/compress.js) -->

# compress.js
A JavaScript client side image compression. This library uses the Canvas API to compress the image, and thus will not work on the node.js server-side.

### Advantage:

- quick compression on the client-side
- compress multiple images and convert them to base64 string
- save data by compressing it on the client-side before sending to the server
- automatically resize the image to max 1920px (width or height, but mantains the aspect ratio of the images)
- fix image rotation issue when uploading images from Android an iOS

### NOTE:

There are several limitations for this library:
- When working with `image/gif`, the compressed image will no longer animate. 
- When working with `image/png` with transparent background, the compressed image will lose transparency and result in black background.


### Installation
```
npm install compress.js --save
```

### Import

```
const Compress = require('compress.js')
```


### Demo

Try out our demo [here](https://compressjs.herokuapp.com/).

### Usage

```javascript

// Initialization
const compress = new Compress()

// Attach listener
const upload = document.getElementById('upload')
upload.addEventListener('change', function (evt) {
  const files = [...evt.target.files]
  compress.compress(files, {
    size: 4, // the max size in MB, defaults to 2MB
    quality: .75, // the quality of the image, max is 1,
    maxWidth: 1920, // the max width of the output image, defaults to 1920px
    maxHeight: 1920, // the max height of the output image, defaults to 1920px
    resize: true, // defaults to true, set false if you do not want to resize the image width and height
  }).then((data) => {
    // returns an array of compressed images
  })
}, false)


// or simpler
compress.attach('#upload', {
  size: 4,
  quality: .75
}).then((data) => {
  // do something with the compressed image
})
```

```javascript
// example output
[{
  alt: '10mb-image.jpg',
  data: '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD...',
  elapsedTimeInSeconds: 1.9292250000000004,
  endHeightInPx: 1280,
  endSizeInMb: 0.44418832116788315,
  endWidthInPx: 1920, 
  ext: 'image/jpeg',
  initialHeightInPx: 3744,
  initialSizeInMb: 8.989774,
  initialWidthInPx: 5616,
  iterations: 1,
  prefix: 'data:jpeg;base64,'
  quality: 0.75,
  sizeReducedInPercent: 95.058960089899,
}]
```

You can even convert the compressed base64 string to a file before uploading to the server:

```javascript
compress.attach('#upload', {
  size: 4,
  quality: .75
}).then((results) => {
  // Example mimes:
  // image/png, image/jpeg, image/jpg, image/gif, image/bmp, image/tiff, image/x-icon,  image/svg+xml, image/webp, image/xxx, image/png, image/jpeg, image/webp
  // If mime is not provided, it will default to image/jpeg
  const img1 = results[0]
  const base64str = img1.data
  const imgExt = img1.ext
  const file = Compress.convertBase64ToFile(base64str, imgExt)
  // -> Blob {size: 457012, type: "image/png"}
})
```


TODO: Add d.ts to support typescript
