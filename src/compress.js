export function compress(
  file,
  { quality = 0.95, maxWidth = null, maxHeight = null } = {}
) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async function () {
      const source = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };

      const target = {
        width: maxWidth || source.width,
        height: maxHeight || source.height,
      };
      const aspectRatio = Math.min(
        1,
        target.width / source.width,
        target.height / source.height
      );
      target.width = source.width * aspectRatio;
      target.height = source.height * aspectRatio;

      const canvas = document.createElement("canvas");
      canvas.width = target.width;
      canvas.height = target.height;
      const context = canvas.getContext("2d");
      context.drawImage(img, 0, 0, target.width, target.height);

      canvas.toBlob(
        (blob) => {
          const newFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });

          resolve(newFile);
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}
