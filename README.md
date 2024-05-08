<!-- [![Build Status](https://travis-ci.org/alextanhongpin/compress.js.svg?branch=master)](https://travis-ci.org/alextanhongpin/compress.js) -->

# compress.js
A JavaScript client side image compression. This library uses the Canvas API to compress the image, and thus will not work on the node.js server-side.

### Advantage:

- quick compression on the client-side
- save data by compressing it on the client-side before sending to the server
- mantains the aspect ratio of the images when resizing
- fix image rotation issue when uploading images from Android an iOS
- supports cropping the image

### NOTE:

There are several limitations for this library:
- When working with `image/gif`, the compressed image will no longer animate.
- When working with `image/png` with transparent background, the compressed image will lose transparency and result in black background.


### Installation

NPM Package [here](https://www.npmjs.com/package/compress.js).

```
npm install compress.js --save
```

### Import

```
const Compress = require('compress.js')
```

You can also include the `build/compress.min.js` in your project directory, and then importing it using type `module` in the script tag.

```html
<!-- index.html -->
<script type="module" src="index.js"></script>
```

```js
// index.js
import Compress from "./compress.min.js";

// ...
```


### Demo

Try out our demo [here](https://practical-easley-4e78c7.netlify.app/).

### Usage

```js
import Compress from "./compress.min.js";

const compressor = new Compress();

// Listen to file upload events.
upload.addEventListener(
  "change",
  async function (evt) {
	const file = evt.target.files[0];
    const newFile = await compressor.compress(file, {
      quality: 0.95,
      crop: true, // If true, will crop a square image from the center.
      maxWidth: 320, // Image width will not exceed 320px.
      maxHeight: 320, // Image height will not exceed 320px.
    });

    // Display the image on the img element.
    img.src = URL.createObjectURL(newFile);
  },
```
