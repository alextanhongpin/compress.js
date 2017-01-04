(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './core/base64.js', './core/converter.js', './core/file.js', './core/image.js', './core/Photo.js'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./core/base64.js'), require('./core/converter.js'), require('./core/file.js'), require('./core/image.js'), require('./core/Photo.js'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.base64, global.converter, global.file, global.image, global.Photo);
    global.Compress = mod.exports;
  }
})(this, function (exports, _base, _converter, _file, _image, _Photo) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _base2 = _interopRequireDefault(_base);

  var _converter2 = _interopRequireDefault(_converter);

  var _file2 = _interopRequireDefault(_file);

  var _image2 = _interopRequireDefault(_image);

  var _Photo2 = _interopRequireDefault(_Photo);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
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

    function compressFiles(files, options) {
      return Promise.all(files.map(function (file) {
        return compressFile(file, options);
      }));
    }

    function compressFile(file, options) {
      var photo = new _Photo2.default(options);
      photo.start = performance.now();
      photo.alt = file.name;
      photo.ext = file.type;
      photo.startSize = file.size;

      return _file2.default.load(file).then(compressImage(photo));
    }

    function compressImage(photo) {
      return function (src) {
        return _image2.default.load(src).then(function (img) {
          photo.startWidth = img.naturalWidth;
          photo.startHeight = img.naturalHeight;

          if (photo.resize) {
            var _Image$resize = _image2.default.resize(photo.maxWidth, photo.maxHeight)(img.naturalWidth, img.naturalHeight),
                width = _Image$resize.width,
                height = _Image$resize.height;

            photo.endWidth = width;
            photo.endHeight = height;
          } else {
            photo.endWidth = img.naturalWidth;
            photo.endHeight = img.naturalHeight;
          }
          return _converter2.default.imageToCanvas(photo.endWidth, photo.endHeight)(img);
        }).then(function (canvas) {
          photo.iterations = 1;
          photo.base64prefix = _base2.default.prefix(_base2.default.mime(_converter2.default.canvasToBase64(canvas)));
          return loopCompression(canvas, photo.startSize, photo.quality, photo.size, photo.minQuality, photo.iterations);
        }).then(function (base64) {
          photo.finalSize = _base2.default.size(base64);
          return _base2.default.data(base64);
        }).then(function (data) {
          photo.end = performance.now();
          var difference = photo.end - photo.start;

          return {
            data: data,
            timeElapsedInSeconds: difference / 1000,
            alt: photo.alt,
            startSizeInMB: _converter2.default.size(photo.startSize).MB,
            base64prefix: photo.base64prefix,
            finalSizeInMB: _converter2.default.size(photo.finalSize).MB,
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
    function loopCompression(canvas, size) {
      var quality = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      var targetSize = arguments[3];
      var targetQuality = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
      var iterations = arguments[5];

      var base64str = _converter2.default.canvasToBase64(canvas);
      var newSize = _base2.default.size(base64str);

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

    return {
      compress: compressFiles,

      attach: attach
    };
  };

  exports.default = Compress;
});
