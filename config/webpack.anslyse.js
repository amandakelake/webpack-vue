const path = require('path');
const common = require('./webpack.common.js');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();

const prodConfig = merge(common, {
    bail: true, // 出现错误立即停止打包
    devtool: 'cheap-module-source-map',
    output: {
        path: path.join(__dirname, '../dist'), // 所有打出来的JS、images、font、style等都会放到这个目录下
        filename: 'js/[name].[chunkhash].js', // 如无意外，将会在dist目录下多出一个js目录，里面存放着打包出来的JS资源
        // publicPath: '//s3.cdn.com',  添加文件的地址前缀(比如CDN)或者文件夹
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, '../', 'template/index.html'),
            minify: {
                // 压缩 html
                removeComments: true, // 移除注释
                collapseWhitespace: true, // 移除空格
                removeAttributeQuotes: true, // 移除属性引号
            },
        }),
        new BundleAnalyzerPlugin(),
    ],
    optimization: {
        minimizer: [new UglifyJsPlugin()],
    },
});

module.exports = smp.wrap(prodConfig);
