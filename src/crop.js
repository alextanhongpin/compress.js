export function crop(file, { quality = 0.95 } = {}) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = async function () {
      const source = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
      const dim = Math.min(source.width, source.height);
      const target = {
        width: dim,
        height: dim,
        left: 0,
        top: 0,
      };

      if (source.width > source.height) {
        target.left = (source.width - dim) / 2;
      } else {
        target.top = (source.height - dim) / 2;
      }

      const canvas = document.createElement("canvas");
      canvas.width = target.width;
      canvas.height = target.height;
      const context = canvas.getContext("2d");
      context.drawImage(
        img,
        target.left,
        target.top,
        img.width,
        img.height,
        0,
        0,
        img.width,
        img.height
      );
      canvas.toBlob(
        (blob) => {
          resolve(
            new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
          );
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}
