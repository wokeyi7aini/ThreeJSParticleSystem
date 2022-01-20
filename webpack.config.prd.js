const webpack = require('webpack');
const path = require('path');
const DashboardPlugin = require('webpack-dashboard/plugin'),
    UglifyJsPlugin = require('uglifyjs-webpack-plugin'),
    APP_PATH = path.resolve(__dirname, './src/index.js'),
    BUILD_PATH = path.resolve(__dirname, './public');

function resolve(dir) {
    return path.join(__dirname, dir);
}
module.exports = {
    entry: './src/index.js',
    output: {
        path: BUILD_PATH,
        filename: '[name].js', // 输出js
        libraryTarget: 'umd'
    },
    mode: 'production'
};
