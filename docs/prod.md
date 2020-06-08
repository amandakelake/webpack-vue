# webpack+vue 生产环境

#front-end/前端工程化/webpack/应用

接着上篇继续搞起 [webpack+vue 开发环境](https://github.com/amandakelake/webpack-vue/blob/master/README.md)

起步代码 Github 仓库 [GitHub - amandakelake/webpack-vue at development](https://github.com/amandakelake/webpack-vue/tree/development)

本篇我们只搞一个基础版本的生产环境打包，极致的项目打包优化我们后面另开一篇，本篇主要内容

-   `output`配置静态资源输出目录
-   创建 html 入口，自动引入 js、css 资源： `html-webpack-plugin`
-   提取压缩 CSS：`mini-css-extract-plugin` + `optimize-css-assets-webpack-plugin`
-   压缩 JS
-   启动本地 node server，预览打包出来的静态资源，

## 一、初始化生成环境配置

新建一份`config/webpack.prod.js`配置文件（其实之前已经建好了）
然后再`package.json`加一条`script`命令，等会儿我们写完配置，一发`yarn build`应该就妥了

```json
"scripts": {
  "build": "cross-env NODE_ENV=production webpack --progress --config config/webpack.prod.js"
}
```

## 二、配置 output 输出目录

```js
const path = require('path');
const common = require('./webpack.common.js');
const merge = require('webpack-merge');

module.exports = merge(common, {
    bail: true, // 出现错误立即停止打包
    devtool: 'cheap-module-source-map', // 目前最佳实践
    output: {
        path: path.join(__dirname, '../dist'), // 所有打出来的JS、images、font、style等都会放到这个目录下
        filename: 'js/[name].[chunkhash].js', // 如无意外，将会在dist目录下多出一个js目录，里面存放着打包出来的JS资源
    },
});
```

配置完后，我们先尝尝鲜，跑一发`yarn build`，如无意外，会多出一个`dist`文件夹，结构如下

```bash
dist
├── images
│   └── big-logo.808ce48.png
└── js
    ├── app.0ec7c852035a2620c08c.js
    └── app.0ec7c852035a2620c08c.js.map
```

继续往下我们会不断`yarn build`测试效果，如果不每次清理`dist`目录，它下面的资源会越来越多，这里我们先引入一个插件 [clean-webpack-plugin](https://github.com/johnagan/clean-webpack-plugin) 帮我们自动做这个事情

```js
// config/webpack.prod.js

const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge(common, {
    plugins: [new CleanWebpackPlugin()],
});
```

但光有 JS 还不行，还得打出 html 并且把静态资源插入才得行

### 三、`html-webpack-plugin`

这个插件的作用是: 创建 html 入口，无需手动引入 js、css 资源
但它的功能远不至此，有需要的时候再去看看文档即可 [GitHub - jantimon/html-webpack-plugin: Simplifies creation of HTML files to serve your webpack bundles](https://github.com/jantimon/html-webpack-plugin)

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
    // 。。。其他配置
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, '../', 'template/index.html'),
            minify: {
                // 压缩 html
                removeComments: true, // 移除注释
                collapseWhitespace: true, // 移除空格
                removeAttributeQuotes: true, // 移除属性引号
            },
        }),
    ],
});
```

这时候再跑一发 `yarn build`，`dist`目录下会多出一份`index.html`文件，而且已经正确了引用了`js/images`等目录下的静态资源

```html
<!DOCTYPE html><html lang=en><head><meta charset=UTF-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Webpack vue</title></head><body><div id=app></div><script src=js/app.0ec7c852035a2620c08c.js></script></body></html>
```

在现代浏览器的加持下，直接在 chrome 读取这份 html 已经能够看到效果了

## 四、提取压缩 CSS：`mini-css-extract-plugin` + `optimize-css-assets-webpack-plugin`

当使用 vue 单文件组件时，组件内的 CSS 会以 `style` 标签的方式通过 JavaScript 动态注入。这有一些小小的运行时开销，如果你使用服务端渲染，这会导致一段“无样式内容闪烁 (fouc)”

将所有组件的 CSS 提取到同一个文件可以避免这个问题，也会让 CSS 更好地进行压缩和缓存，目前最好用的插件 [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin) ，没有之一

因为还要配置 loader 规则，我们直接在`webpack.common.js`配置好了，后面再来拆

```js
// config/webpack.common.js

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    // 。。。其他配置
    module: {
        rules: [
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
                            importLoaders: 2,
                            modules: false,
                        },
                    },
                    'postcss-loader',
                    'less-loader',
                ],
                exclude: /node_modules/,
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
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].css', // css将会被打到 dist/css 目录下
            chunkFilename: 'css/[id].css',
        }),
    ],
};
```

提取出来，自然是要再压缩一下的，直接上插件 [GitHub - NMFR/optimize-css-assets-webpack-plugin: A Webpack plugin to optimize \ minimize CSS assets.](https://github.com/NMFR/optimize-css-assets-webpack-plugin)

```js
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

// ...写入plugins数组中
new OptimizeCSSAssetsPlugin();
```

跑一发`yarn build`，输出如下

```bash
dist
├── css
│   ├── app.css
│   └── app.css.map
├── images
│   └── big-logo.808ce48.png
├── index.html
└── js
    ├── app.6bf4e837c148ee4d8764.js
    └── app.6bf4e837c148ee4d8764.js.map
```

## 五、压缩 JS

[UglifyjsWebpackPlugin | webpack](https://webpack.js.org/plugins/uglifyjs-webpack-plugin/) 用法也是极其简单

```js
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    optimization: {
        minimizer: [new UglifyJsPlugin()],
    },
};
```

## 六、启动静态文件服务器: `koa、koa-static`

虽然现代浏览器能够直接读取我们打包出来的`index.html`文件并且能正确读取依赖的静态资源，但到了线上其实是 `nginx`这种静态资源服务器来读取的，我们起个`node server`模拟一下真实环境吧

```bash
mkdir server && touch server/server.js
# koa-static 是一个静态资源中间件
yarn add -D koa koa-static
```

```js
// server/server.js

const Koa = require('koa');
const path = require('path');
const app = new Koa();
const KoaStatic = require('koa-static');

app.use(KoaStatic(path.join(__dirname, '../dist')));

app.listen(3000, () => {
    console.log('server start at http://localhost:3000');
});
```

```bash
# 启动一个本地服务器，然后访问 http://localhsot:3000 即可看到打包后的页面效果
node server/server.js
```

## 七、小结

到目前为止，我们已经完成了最基本的一个 vue 生产环境的搭建，代码在 `production`分支，需要的同学可自取

这里只是一个非常简单的生产环境的配置，在实际的公司项目中，还有很多的优化项，如合并开发和生产环境配置、优化构建速度、开发体验、公共资源加速、代码按需加载等等一系列，那么我们下期再见
