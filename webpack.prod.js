const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
var path = require("path");

module.exports = merge(common, {
    mode: 'production',
    output: {
        path: path.resolve(__dirname, "build/"),
        publicPath: "/public/",
        filename: "main.bundle.[contenthash].js",
        clean: true,
    },
    entry: {
        main: "/src/components/Main.js"
    },
    plugins: [
        new webpack.DefinePlugin({
          "process.env.dbSetUrl": JSON.stringify("prod")
        })
    ]
});