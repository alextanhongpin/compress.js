(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', './core/base64.js', './core/converter.js', './core/file.js', './core/image.js', './core/model.js'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, require('./core/base64.js'), require('./core/converter.js'), require('./core/file.js'), require('./core/image.js'), require('./core/model.js'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, global.base64, global.converter, global.file, global.image, global.model);
    global.Compress = mod.exports;
  }
})(this, function (module, _base, _converter, _file, _image, _model) {
  'use strict';

  var _base2 = _interopRequireDefault(_base);

  var _converter2 = _interopRequireDefault(_converter);

  var _file2 = _interopRequireDefault(_file);

  var _image2 = _interopRequireDefault(_image);

  var _model2 = _interopRequireDefault(_model);

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
      var photo = new _model2.default(options);
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

  module.exports = Compress;
});
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.base64 = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var size = function size(base64) {
    var len = base64.replace(/^data:image\/\w+;base64,/, '').length;
    return (len - 814) / 1.37;
  };

  var mime = function mime(base64) {
    return base64.split(';')[0].match(/jpeg|png|gif/)[0];
  };

  var data = function data(base64) {
    return base64.replace(/^data:image\/\w+;base64,/, '');
  };

  var prefix = function prefix(ext) {
    return 'data:' + ext + ';base64,';
  };

  exports.default = { size: size, mime: mime, data: data, prefix: prefix };
});
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.converter = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var base64ToFile = function base64ToFile(base64) {
    var byteString = window.atob(base64);
    var mimestring = 'image/jpeg';
    var content = [];
    for (var i = 0; i < byteString.length; i++) {
      content[i] = byteString.charCodeAt(i);
    }
    return new window.Blob([new Uint8Array(content)], { type: mimestring });
  };

  var imageToCanvas = function imageToCanvas(width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return function (image) {
      var context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas;
    };
  };

  var canvasToBase64 = function canvasToBase64(canvas) {
    var quality = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : .75;

    var base64 = canvas.toDataURL('image/jpeg', quality);
    return base64;
  };

  function size(size) {
    return {
      KB: size / 1000,
      MB: size / (1000 * 1000)
    };
  }

  exports.default = { base64ToFile: base64ToFile, imageToCanvas: imageToCanvas, canvasToBase64: canvasToBase64, size: size };
});
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.file = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var load = function load(file) {
    return new Promise(function (resolve, reject) {
      var fileReader = new FileReader();
      fileReader.addEventListener('load', function (evt) {
        resolve(evt.target.result);
      }, false);

      fileReader.addEventListener('error', function (err) {
        reject(err);
      }, false);

      fileReader.readAsDataURL(file);
    });
  };

  exports.default = { load: load };
});
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.image = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var load = function load(src) {
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
  };

  var resize = function resize(targetWidth, targetHeight) {
    return function (width, height) {
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
  };

  exports.default = { load: load, resize: resize };
});
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.model = mod.exports;
  }
})(this, function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var Photo = function Photo(_ref) {
    var _ref$quality = _ref.quality,
        quality = _ref$quality === undefined ? 0.75 : _ref$quality,
        _ref$size = _ref.size,
        size = _ref$size === undefined ? 2 : _ref$size,
        _ref$maxWidth = _ref.maxWidth,
        maxWidth = _ref$maxWidth === undefined ? 1920 : _ref$maxWidth,
        _ref$maxHeight = _ref.maxHeight,
        maxHeight = _ref$maxHeight === undefined ? 1920 : _ref$maxHeight,
        _ref$resize = _ref.resize,
        resize = _ref$resize === undefined ? true : _ref$resize;

    _classCallCheck(this, Photo);

    this.start = performance.now();
    this.end = null;

    this.alt = null;
    this.ext = null;
    this.startSize = null;
    this.startWidth = null;
    this.startHeight = null;
    this.quality = quality;

    this.size = size * 1000 * 1000;
    this.endSize = null;
    this.endWidth = null;
    this.endHeight = null;
    this.iterations = 0;
    this.base64prefix = null;

    this.resize = resize;
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
  };

  exports.default = Photo;
});
