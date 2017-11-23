
const load = (src) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.addEventListener('load', () => {
      resolve(img)
    }, false)

    img.addEventListener('error', (err) => {
      reject(err)
    }, false)

    img.src = src
  })
}
  /*
   * Resize the image based on the given height or width boundary.
   * Auto resize based on aspect ratio.
  **/
const resize = (targetWidth, targetHeight) => {
  return (width, height) => {
    if (!targetWidth && !targetHeight) return { width, height }

    const originalAspectRatio = width / height
    const targetAspectRatio = targetWidth / targetHeight

    let outputWidth, outputHeight

    if (originalAspectRatio > targetAspectRatio) {
      outputWidth = Math.min(width, targetWidth)
      outputHeight = outputWidth / originalAspectRatio
    } else {
      outputHeight = Math.min(height, targetHeight)
      outputWidth = outputHeight * originalAspectRatio
    }

    return { width: outputWidth, height: outputHeight }
  }
}

export default { load, resize }
