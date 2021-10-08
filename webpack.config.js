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
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"]
            },
            {
              test: /\.(gif|svg|jpg|png)$/,
              loader: "file-loader",
            }
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
