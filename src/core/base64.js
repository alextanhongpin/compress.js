const size = (base64) => {
  const len = base64.replace(/^data:image\/\w+;base64,/, '').length
  return (len - 814) / 1.37
  // return len * 3 / 4
}

// strip off the data: url prefix to get just the base64-encoded bytes
// var data = img.replace(/^data:image\/\w+;base64,/, "");
const mime = (base64) => {
  return base64.split(';')[0].match(/jpeg|png|gif/)[0]
}

const data = (base64) => {
  return base64.replace(/^data:image\/\w+;base64,/, '')
}

const prefix = (ext) => {
  return `data:${ext};base64,`
}

export default { size, mime, data, prefix }
