<!-- [![Build Status](https://travis-ci.org/alextanhongpin/compress.js.svg?branch=master)](https://travis-ci.org/alextanhongpin/compress.js) -->

# compress.js
A JavaScript client side image compression. This library uses the Canvas API to compress the image, and thus will not work on the node.js server-side.

### Advantage:

- quick compression on the client-side
- compress multiple images and convert them to base64 string
- save data by compressing it on the client-side before sending to the server
- automatically resize the image to max 1920px (width or height, but mantains the aspect ratio of the images)

### Installation
```
npm install compress.js --save
```

### Import

```
const Compress = require('compress.js')
```


### Usage:

```javascript

// Initialization
const compress = new Compress()

// Attach listener
const upload = document.getElementById('upload')
upload.addEventListener('change', function (evt) {
  const files = [...evt.target.files]
  compress.compress(files, {
    size: 4, // the max size in MB, defaults to 2MB
    quality: .75 // the quality of the image, max is 1,
    maxWidth: 1920, // the max width of the output image, defaults to 1920px
    maxHeight: 1920, // the max height of the output image, defaults to 1920px
    resize: true, // defaults to true, set false if you do not want to resize the image width and height
  }).then((data) => {
    // returns an array of compressed images
    console.log(data[0])
    // alt: "10mb-image.jpg"
    // base64prefix: "data:jpeg;base64,"
    // data: "/9j/4AAQS...
    // endHeightInPX: 1280
    // endWidthInPX: 1920
    // ext: "image/jpeg"
    // finalSizeInMB: 0.26388
    // iterations: 1
    // quality: 0.75
    // sizeReducedInPercent: 97.06466480692396
    // startHeightInPX: 3744
    // startSizeInMB: 8.989774
    // startWidthInPX: 5616
    // timeElapsedInSeconds: 3.2430549999999987
  })
}, false)


// or simpler
compress.attach('#upload', {
  size: 4,
  quality: .75
}).then((data) => {
  console.log('uploaded compressed ', data)
})
```
