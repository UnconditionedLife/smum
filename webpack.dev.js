const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
var path = require("path");

module.exports = merge(common, {
    mode: 'development',
    resolve: {
        alias: {
          'react-dom': '@hot-loader/react-dom'
        }
    },
    output: {
        path: path.resolve(__dirname, "/"),
        publicPath: "/",
        filename: "main.bundle.js"
    },
    plugins: [
        new webpack.DefinePlugin({
          "process.env.dbSetUrl": JSON.stringify("dev")
        })
    ]
});
