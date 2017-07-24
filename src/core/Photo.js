// The photo model
class Photo {
  constructor ({ quality = 0.75, size = 2, maxWidth = 1920, maxHeight = 1920, resize = true }) {
    this.start = window.performance.now()
    this.end = null

    this.alt = null
    this.ext = null
    this.startSize = null
    this.startWidth = null
    this.startHeight = null
    // How much will the quality decrease by each compression
    // this.stepQuality = stepQuality

    // size in MB
    this.size = size * 1000 * 1000
    this.endSize = null
    this.endWidth = null
    this.endHeight = null
    this.iterations = 0
    this.base64prefix = null
    // Carry out image resizing
    this.quality = quality
    this.resize = resize
    this.maxWidth = maxWidth
    this.maxHeight = maxHeight
    this.orientation = 1
  }
}
export default Photo
