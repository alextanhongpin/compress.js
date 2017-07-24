(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', './core/base64.js', './core/converter.js', './core/file.js', './core/image.js', './core/photo.js', './core/rotate.js'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, require('./core/base64.js'), require('./core/converter.js'), require('./core/file.js'), require('./core/image.js'), require('./core/photo.js'), require('./core/rotate.js'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, global.base64, global.converter, global.file, global.image, global.photo, global.rotate);
    global.compress = mod.exports;
  }
})(this, function (module, _base, _converter, _file, _image, _photo, _rotate) {
  'use strict';

  var _base2 = _interopRequireDefault(_base);

  var _converter2 = _interopRequireDefault(_converter);

  var _file2 = _interopRequireDefault(_file);

  var _image2 = _interopRequireDefault(_image);

  var _photo2 = _interopRequireDefault(_photo);

  var _rotate2 = _interopRequireDefault(_rotate);

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

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var Compress = function () {
    function Compress() {
      _classCallCheck(this, Compress);
    }

    _createClass(Compress, [{
      key: 'attach',
      value: function attach(el, options) {
        var _this = this;

        return new Promise(function (resolve, reject) {
          var input = document.querySelector(el);
          input.setAttribute('accept', 'image/*');
          input.addEventListener('change', function (evt) {
            var output = _this.compress([].concat(_toConsumableArray(evt.target.files)), options);
            resolve(output);
          }, false);
        });
      }
    }, {
      key: 'compress',
      value: function compress(files, options) {
        function compressFile(file, options) {
          var photo = new _photo2.default(options);
          photo.start = window.performance.now();
          photo.alt = file.name;
          photo.ext = file.type;
          photo.startSize = file.size;

          Promise.resolve().then(_rotate2.default.orientation(file)).then(function (orientation) {
            console.log('orientation=', orientation);
            photo.orientation = orientation;
            return _file2.default.load(file);
          }).then(compressImage(photo));
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
              return _converter2.default.imageToCanvas(photo.endWidth, photo.endHeight, photo.orientation)(img);
            }).then(function (canvas) {
              photo.iterations = 1;

              photo.base64prefix = _base2.default.prefix(photo.ext);
              return loopCompression(canvas, photo.startSize, photo.quality, photo.size, photo.minQuality, photo.iterations);
            }).then(function (base64) {
              photo.finalSize = _base2.default.size(base64);
              return _base2.default.data(base64);
            }).then(function (data) {
              photo.end = window.performance.now();
              var difference = photo.end - photo.start;

              return {
                data: data,
                prefix: photo.base64prefix,
                elapsedTimeInSeconds: difference / 1000,
                alt: photo.alt,
                initialSizeInMb: _converter2.default.size(photo.startSize).MB,
                endSizeInMb: _converter2.default.size(photo.finalSize).MB,
                ext: photo.ext,
                quality: photo.quality,
                endWidthInPx: photo.endWidth,
                endHeightInPx: photo.endHeight,
                initialWidthInPx: photo.startWidth,
                initialHeightInPx: photo.startHeight,
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

          var base64str = _converter2.default.canvasToBase64(canvas, quality);
          var newSize = _base2.default.size(base64str);

          iterations += 1;

          if (newSize > targetSize) {
            return loopCompression(canvas, newSize, quality - 0.1, targetSize, targetQuality, iterations);
          }

          if (quality > targetQuality) {
            return loopCompression(canvas, newSize, quality - 0.1, targetSize, targetQuality, iterations);
          }

          if (quality < 0.5) {
            return base64str;
          }
          return base64str;
        }
        return Promise.all(files.map(function (file) {
          return compressFile(file, options);
        }));
      }
    }], [{
      key: 'convertBase64ToFile',
      value: function convertBase64ToFile(base64, mime) {
        return _converter2.default.base64ToFile(base64, mime);
      }
    }]);

    return Compress;
  }();

  module.exports = Compress;
});
