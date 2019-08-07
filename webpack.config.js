var path = require("path");
var webpack = require("webpack");

module.exports = {
  entry: "./public/components/Main.js",
  output: {
    path: path.resolve(__dirname, "public/components"),
    filename: "main.bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: ["babel-loader"]
      }
    ]
  },
  stats: {
    colors: true
  },
  devtool: "source-map"
};
