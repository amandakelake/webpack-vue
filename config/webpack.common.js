const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

// 路径处理函数 减少路径书写:
// webpack里面的相对路径是以当前的配置文件为基准的，不是以根路径为准
const resolve = (dir) => path.join(__dirname, '..', dir);

module.exports = {
    mode: process.env.NODE_ENV,
    // 入口
    entry: {
        app: resolve('src/index.js'),
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'], // 引入 js vue json 文件时可以不用写后缀名
        alias: {
            '@': resolve('src'), // 配置 @ 指向 src
        },
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
                exclude: /(node_modules)/,
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.less$/,
                // 从下到上执行
                use: [
                    'style-loader',
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            esModule: true,
                        },
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            // less里面直接@import其他的less文件的时候，直接走css-loader  会漏掉前面的两个loader
                            importLoaders: 2, // 强制import要走前面的2个loader, postcss-loader和less-loader
                            modules: false, // 样式模块化 CSS Module 防止样式冲突
                        },
                    },
                    'postcss-loader',
                    'less-loader',
                ],
                exclude: /node_modules/, // 排除该文件夹下面的文件
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            esModule: true, // 方便开启 tree-shaking
                        },
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            modules: false,
                        },
                    },
                    'postcss-loader',
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                // url-loader works like file-loader, but can return a DataURL if the file is smaller than a byte limit.
                loader: 'url-loader',
                options: {
                    limit: 5120, // 把小于这个size的文件打包成base64的格式，内嵌进代码里，可以省http请求去请求图片
                    outputPath: 'images', // 大于limit值，图片会直接被放到dist（output里设置的dist）目录下的这个文件夹，需要安装file-loader
                    name: '[name].[hash:7].[ext]',
                },
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10240,
                    outputPath: 'fonts',
                    name: '[name].[hash:7].[ext]',
                },
            },
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: 'css/[id].css',
        }),
        new OptimizeCSSAssetsPlugin(),
    ],
    stats: {
        children: false, // 避免过多子信息
    },
};
