"use strict";

window.onload = (async function () {
  const compressor = new window.Compress();
  const browserSupportsExifOrientation = () => {
    return new Promise((resolve) => Modernizr.on("exiforientation", resolve));
  };

  // Only rotate if browser does not support exit orientation.
  const shouldRotate = async () => {
    const supported = await browserSupportsExifOrientation();
    return !supported;
  };
  const rotate = await shouldRotate();
  console.log({ rotate });

  const upload = document.getElementById("upload");
  const preview = document.getElementById("preview");
  upload.addEventListener(
    "change",
    async function (evt) {
      const files = [...evt.target.files];
      const results = await compressor.compress(files, {
        size: 4,
        quality: 0.75,
        rotate,
      });
      console.log(results);
      const output = results[0];
      const file = Compress.convertBase64ToFile(output.data, output.ext);
      console.log(file);
      preview.src = output.prefix + output.data;
    },
    false
  );
})();
