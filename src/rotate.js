try {
  // Handle window/document not found in nodejs.
  await import("./lib/modernizr.js");
} catch {
  globalThis.Modernizr = { exiforientation: true };
}

// https://stackoverflow.com/questions/20600800/js-client-side-exif-orientation-rotate-and-mirror-jpeg-images/31273162#31273162
export async function rotate(file, { quality = 1.0 } = {}) {
  // Only rotate if browser does not support exit orientation.
  if (Modernizr.exiforientation) return file;

  const orientation = await getOrientation(file);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = async function () {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = width;
      canvas.height = height;

      if (orientation > 4) {
        canvas.width = height;
        canvas.height = width;
      }
      switch (orientation) {
        case 2:
          // horizontal flip
          context.translate(width, 0);
          context.scale(-1, 1);
          break;
        case 3:
          // 180° rotate left
          context.translate(width, height);
          context.rotate(Math.PI);
          break;
        case 4:
          // vertical flip
          context.translate(0, height);
          context.scale(1, -1);
          break;
        case 5:
          // vertical flip + 90 rotate right
          context.rotate(0.5 * Math.PI);
          context.scale(1, -1);
          break;
        case 6:
          // 90° rotate right
          context.rotate(0.5 * Math.PI);
          context.translate(0, -height);
          break;
        case 7:
          // horizontal flip + 90 rotate right
          context.rotate(0.5 * Math.PI);
          context.translate(width, -height);
          context.scale(-1, 1);
          break;
        case 8:
          // 90° rotate left
          context.rotate(-0.5 * Math.PI);
          context.translate(-width, 0);
          break;
      }
      if (orientation > 4) {
        context.drawImage(img, 0, 0, canvas.height, canvas.width);
      } else {
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      }

      canvas.toBlob(
        (blob) => {
          const newFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });

          if (newFile.size > file.size) {
            console.log("Compression failed", newFile.size, file.size);
            resolve(newFile);
          } else {
            resolve(newFile);
          }
        },
        file.type,
        quality
      );
    };
    img.src = URL.createObjectURL(file);
  });
}

function getOrientation(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      var view = new DataView(event.target.result);

      if (view.getUint16(0, false) !== 0xffd8) {
        resolve(-2);
      }
      const length = view.byteLength;
      let offset = 2;

      while (offset < length) {
        const marker = view.getUint16(offset, false);
        offset += 2;

        if (marker === 0xffe1) {
          if (view.getUint32((offset += 2), false) !== 0x45786966) {
            resolve(-1);
          }
          const little = view.getUint16((offset += 6), false) === 0x4949;
          offset += view.getUint32(offset + 4, little);
          const tags = view.getUint16(offset, little);
          offset += 2;

          for (let i = 0; i < tags; i++) {
            if (view.getUint16(offset + i * 12, little) === 0x0112) {
              resolve(view.getUint16(offset + i * 12 + 8, little));
            }
          }
        } else if ((marker & 0xff00) !== 0xff00) break;
        else offset += view.getUint16(offset, false);
      }
      resolve(-1);
    };
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  });
}
