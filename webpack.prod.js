const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
var path = require("path");

module.exports = merge(common, {
    mode: 'production',
    output: {
        path: path.resolve(__dirname, "build/"),
        publicPath: "/build/",
        filename: "main.bundle.js"
    },
});