const path = require('path');
const webpack = require('webpack');
const common = require('./webpack.common.js');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

module.exports = merge(common, {
    // 代码追踪
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        hot: true, // 热更新
        port: 8081,
        open: false,
        quiet: true, // 关闭 webpack-dev-server 的提示，用 friendly-error-plugin
        overlay: true,
        host: 'localhost',
        clientLogLevel: 'warning', // 控制台提示信息级别是 warning 以上
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, '../template/index.html'),
        }),
        new webpack.HotModuleReplacementPlugin(),
        new FriendlyErrorsPlugin(),
    ],
});
