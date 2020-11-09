var path = require("path");
var webpack = require("webpack");

module.exports = {
  entry: "./public/components/Main.js",
  output: {
    path: path.resolve(__dirname, "public/components"),
    publicPath: "/public/components",
    filename: "main.bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: ["babel-loader"]
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-url-loader',
            options: {
              limit: 10000,
            },
          },
        ],
      },
    ]
  },
  stats: {
    colors: true
  },
  devServer: {
    port: 3002,
    historyApiFallback: true
  },
  devtool: "source-map"
};
