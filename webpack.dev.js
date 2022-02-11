const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
var path = require("path");

module.exports = merge(common, {
    mode: 'development',
    resolve: {
        alias: {
          'react-dom': '@hot-loader/react-dom'
        }
    },
    output: {
        path: path.resolve(__dirname, "/components"),
        publicPath: "/components",
        filename: "main.bundle.js"
    },
});
