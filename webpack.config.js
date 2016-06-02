'use strict';  /* eslint strict: 0 */

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');


const publicPath = '/static/';
const extraPlugins = [];
const chunkhashPlaceholder = '';

const config = {
    context: path.resolve(__dirname, 'largefile_upload/assets'),
    resolve: {
        root: [
            path.resolve(__dirname, 'largefile_upload/assets'),
        ],
    },
    entry: {
        upload: ['./js/upload.jsx'],
        files: ['./js/files.jsx'],
    },
    output: {
        publicPath,
        path: path.resolve(__dirname, 'largefile_upload/static'),
        filename: `[name].${chunkhashPlaceholder}js`,
        chunkFilename: `[name].${chunkhashPlaceholder}js`,
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'commons',
            filename: `commons.${chunkhashPlaceholder}js`,
            minChunks: 3,
        }),
        new ExtractTextPlugin(`[name].${chunkhashPlaceholder}css`),
        new webpack.optimize.OccurenceOrderPlugin(true),
    ].concat(extraPlugins),
    module: {
        loaders: [
            { test: /\.jsx?$/, loader: 'babel' },
            { test: /\.css$/, loaders: ["style", "css"] },
            // { test: /\.scss$/, loaders: ["style", "css", "resolve-url", "sass?sourceMap"] },
            {
                test: /\.scss/,
                loader: ExtractTextPlugin.extract(
                    "style-loader", "css-loader!resolve-url-loader!sass-loader?sourceMap"),
            },
            { test: /\.png|jpg$/, loader: "url?limit=5000&name=[path][name].[hash:8].[ext]" },
        ],
    },
    externals: {
        react: "React",
        "react-dom": "ReactDOM",
        jquery: "jQuery",
    },
    devtool: 'source-map',
};

module.exports = config;
