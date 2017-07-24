
const base64ToFile = (base64, mime = 'image/jpeg') => {
  const byteString = window.atob(base64)
  const content = []
  for (let i = 0; i < byteString.length; i++) {
    content[i] = byteString.charCodeAt(i)
  }
  return new window.Blob([new Uint8Array(content)], {type: mime})
}

const imageToCanvas = (width, height, orientation) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = width
  canvas.height = height
  // canvas.style.width = width
  // canvas.style.height = height

  return (image) => {
    if (!orientation || orientation > 8) {
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      return canvas
    }
    if (orientation > 4) {
      canvas.width = height
      canvas.height = width
      // canvas.style.width = height
      // canvas.style.height = width
    }
    switch (orientation) {
      case 2:
        // horizontal flip
        context.translate(width, 0)
        context.scale(-1, 1)
        break
      case 3:
        // 180° rotate left
        context.translate(width, height)
        context.rotate(Math.PI)
        break
      case 4:
        // vertical flip
        context.translate(0, height)
        context.scale(1, -1)
        break
      case 5:
        // vertical flip + 90 rotate right
        context.rotate(0.5 * Math.PI)
        context.scale(1, -1)
        break
      case 6:
        // 90° rotate right
        context.rotate(0.5 * Math.PI)
        context.translate(0, -height)
        break
      case 7:
        // horizontal flip + 90 rotate right
        context.rotate(0.5 * Math.PI)
        context.translate(width, -height)
        context.scale(-1, 1)
        break
      case 8:
        // 90° rotate left
        context.rotate(-0.5 * Math.PI)
        context.translate(-width, 0)
        break
    }
    if (orientation > 4) {
      context.drawImage(image, 0, 0, canvas.height, canvas.width)
    } else {
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
    }
    return canvas
  }
}

const canvasToBase64 = (canvas, quality = 0.75) => {
  // in order to compress the final image format has to be jpeg
  const base64 = canvas.toDataURL('image/jpeg', quality)
  return base64
}

// const canvasToImage = (canvas, quality=.75, mimeType='image/jpeg') => {
//   const image = new Image()
//   const base64str = canvas.toDataURL(mimeType, quality)
//   image.src = base64str
//   return image
// }

const size = (size) => {
  return {
    KB: size / 1000,
    MB: size / (1000 * 1000)
  }
}

export default { base64ToFile, imageToCanvas, canvasToBase64, size }
