import { rotate } from "./rotate.js";
import { crop } from "./crop.js";
import { compress } from "./compress.js";

export default class Compress {
  constructor({
    maxWidth,
    maxHeight,
    quality = 0.95,
    crop = false,
    aspectRatio = "1:1",
  } = {}) {
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this.quality = quality;
    this.crop = crop;
    this.aspectRatio = aspectRatio;
  }

  async compress(file, options) {
    const opts = {
      maxWidth: this.maxWidth,
      maxHeight: this.maxHeight,
      quality: this.quality,
      crop: this.crop,
      aspectRatio: this.aspectRatio,
      ...options,
    };
    const steps = [rotate];
    if (opts.crop) steps.push(crop);
    steps.push(compress);
    for (const step of steps) {
      file = await step(file, opts);
    }
    return file;
  }
}
