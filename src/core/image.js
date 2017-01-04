
const load = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
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
    const aspectRatio = width / height

    if (!targetWidth && !targetHeight) return { width, height }

    const outputWidth = Math.min(width, targetWidth)
    const outputHeight = Math.min(height, targetHeight)

    if (outputWidth) {
      
      const scaleWidth = width / outputWidth
      const h = height / scaleWidth

      return { width: outputWidth, height: h }
    } else {

      const scaleHeight = height / outputHeight
      const w = width / scaleHeight

      return { width: w, height: outputHeight }
    }
  }
}


export default { load, resize }
