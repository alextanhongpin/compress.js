(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod);
    global.Compress = mod.exports;
  }
})(this, function (module) {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  var Compress = function Compress() {

    function attach(el, options) {
      return new Promise(function (resolve, reject) {
        var input = document.querySelector(el);
        input.setAttribute('accept', 'image/*');
        input.addEventListener('change', function (evt) {
          var output = compressFiles([].concat(_toConsumableArray(evt.target.files)), options);
          resolve(output);
        }, false);
      });
    }
    function compressImage(photo) {
      return function (src) {
        return loadImage(src).then(function (img) {
          photo.startWidth = img.naturalWidth;
          photo.startHeight = img.naturalHeight;

          if (photo.resize) {
            var _resize = resize(photo.maxWidth, photo.maxHeight)(img),
                width = _resize.width,
                height = _resize.height;

            photo.endWidth = width;
            photo.endHeight = height;
          } else {
            photo.endWidth = img.naturalWidth;
            photo.endHeight = img.naturalHeight;
          }
          return convertImageToCanvas(photo.endWidth, photo.endHeight)(img);
        }).then(function (canvas) {
          photo.iterations = 1;
          photo.base64prefix = getStrip(getExtension(convertCanvasToBase64(canvas)));
          return loopCompression(canvas, photo.startSize, photo.quality, photo.size, photo.minQuality, photo.iterations);
        }).then(function (base64) {
          photo.finalSize = getFileSize(base64);
          return stripData(base64);
        }).then(function (data) {
          photo.end = performance.now();
          var difference = photo.end - photo.start;

          return {
            data: data,
            timeElapsedInSeconds: difference / 1000,
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
          };
        });
      };
    }

    function compressFile(file, options) {
      var photo = new Photo(options);
      photo.start = performance.now();
      photo.alt = file.name;
      photo.ext = file.type;
      photo.startSize = file.size;

      return read(file).then(compressImage(photo));
    }

    function compressFiles(files, options) {
      return Promise.all(files.map(function (file) {
        return compressFile(file, options);
      }));
    }

    function initCanvas(_ref) {
      var width = _ref.width,
          height = _ref.height;

      var canvas = document.createElement('canvas');

      canvas.width = width;
      canvas.height = height;
      return canvas;
    }

    function read(file) {
      return new Promise(function (resolve, reject) {
        var fileReader = new FileReader();
        fileReader.addEventListener('load', function (evt) {
          resolve(evt.target.result);
        }, false);

        fileReader.addEventListener('error', function (err) {
          reject(err);
        });

        fileReader.readAsDataURL(file);
      });
    }

    function loadImage(src) {
      return new Promise(function (resolve, reject) {
        var img = new Image();
        img.addEventListener('load', function () {
          resolve(img);
        }, false);

        img.addEventListener('error', function (err) {
          reject(err);
        }, false);

        img.src = src;
      });
    }

    function convertImageToCanvas(width, height) {
      var canvas = document.createElement("canvas");
      var context = canvas.getContext('2d');
      return function (image) {
        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        return canvas;
      };
    }

    function convertCanvasToBase64(canvas) {
      var quality = .5;

      var base64str = canvas.toDataURL('image/jpeg', quality);
      return base64str;
    }

    function convertCanvasToImage(canvas) {
      var image = new Image();
      var quality = .5;

      var base64str = canvas.toDataURL('image/jpeg', quality);
      image.src = base64str;

      return image;
    }

    function handleFiles(evt) {
      var files = evt.target.files;
      var validImageFiles = [].concat(_toConsumableArray(files)).filter(filterImage);
    }

    function filterImage(file) {
      return file.type.match("image.*");
    }

    function previewFile() {
      var preview = document.querySelector('img');
      var file = document.querySelector('input[type=file]').files[0];
      var reader = new FileReader();

      reader.addEventListener("load", function () {
        preview.src = reader.result;
      }, false);

      if (file) {
        reader.readAsDataURL(file);
      }
    }

    function resize(targetWidth, targetHeight) {
      return function (img) {

        var width = img.naturalWidth;
        var height = img.naturalHeight;
        var aspectRatio = width / height;

        if (!targetWidth && !targetHeight) return { width: width, height: height };

        var outputWidth = Math.min(width, targetWidth);
        var outputHeight = Math.min(height, targetHeight);

        if (outputWidth) {

          var scaleWidth = width / outputWidth;
          var h = height / scaleWidth;

          return { width: outputWidth, height: h };
        } else {

          var scaleHeight = height / outputHeight;
          var w = width / scaleHeight;

          return { width: w, height: outputHeight };
        }
      };
    }

    function loopCompression(canvas, size) {
      var quality = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      var targetSize = arguments[3];
      var targetQuality = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
      var iterations = arguments[5];

      var base64str = convertCanvasToBase64(canvas);
      var newSize = getFileSize(base64str);

      iterations += 1;


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
      };
    }

    function getFileSize(base64str) {
      var base64len = base64str.replace(/^data:image\/\w+;base64,/, "").length;
      var size = base64len * 3 / 4;
      return size;
    }

    function getExtension(base64) {
      var ext = base64.split(';')[0].match(/jpeg|png|gif/)[0];

      return ext;
    }

    function stripData(data) {
      return data.replace(/^data:image\/\w+;base64,/, "");
    }

    function getStrip(ext) {
      return 'data:' + ext + ';base64,';
    }

    return {
      compress: compressFiles,

      attach: attach
    };
  };

  var Photo = function Photo(props) {
    _classCallCheck(this, Photo);

    this.start = performance.now();
    this.end = null;

    this.alt = null;
    this.ext = null;
    this.startSize = null;
    this.startWidth = null;
    this.startHeight = null;
    this.quality = props && props.quality ? Math.abs(props.quality) : .75;

    this.stepQuality = .5;

    this.size = props && props.size ? props.size * 1000 * 1000 : 2 * 1000 * 1000;
    this.endSize = null;
    this.endWidth = null;
    this.endHeight = null;
    this.iterations = 0;
    this.base64prefix = null;

    this.resize = true;
    this.maxWidth = 1920;
    this.maxHeight = 1920;
  };

  module.exports = Compress;
});
