export function crop(file, { quality = 0.95, aspectRatio = "1:1" } = {}) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = async function () {
      const source = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };

      const targetRatio = parseAspectRatio(aspectRatio);
      const sourceRatio = source.width / source.height;

      const target = {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
      };
      if (sourceRatio > targetRatio) {
        target.height = source.height;
        target.width = source.height * targetRatio;
      } else {
        target.width = source.width;
        target.height = source.width / targetRatio;
      }

      if (source.width > target.width) {
        target.left = (source.width - target.width) / 2;
      } else if (source.height - target.height) {
        target.top = (source.height - target.height) / 2;
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

function parseAspectRatio(aspectRatio) {
  if (!aspectRatio.includes(":")) {
    throw new Error("invalid aspect ratio");
  }

  const [width, height] = aspectRatio.split(":").map(Number);
  if (!width || !height) {
    throw new Error("invalid aspect ratio");
  }

  return width / height;
}
