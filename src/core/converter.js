
const base64ToFile = (base64, mime = 'image/jpeg') => {
  const byteString = window.atob(base64)
  const content = []
  for (let i = 0; i < byteString.length; i++) {
    content[i] = byteString.charCodeAt(i)
  }
  return new window.Blob([new Uint8Array(content)], {type: mime})
}

const imageToCanvas = (width, height) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return (image) => {
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
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
