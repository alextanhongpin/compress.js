const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    library: {
      name: "Compress",
      type: "umd",
      export: "default", // Allows window.Compress instead of window.Compress.default
    },
    globalObject: "this",
    filename: "index.js",
    path: path.resolve(__dirname, "build"),
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: ["@babel/plugin-transform-modules-commonjs"],
          },
        },
      },
    ],
  },
  mode: "production",
};
