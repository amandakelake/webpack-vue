# webpack+vue 从零开始搭建开发环境

> 完整代码在 [development](https://github.com/amandakelake/webpack-vue/tree/development) 分支

## 一、repo+npm+git 初始化+目录结构

```bash
# 进合适的目录新建项目
mkdir webpack-vue && cd webpack-vue

# 初始化git仓库
git init
# .gitignore文件的内容随便找一个项目拷贝进来就行
touch .gitignore

# npm初始化
# 后续我会用yarn来替代npm，二选一即可，不要同时使用
npm init -y
```

初始化目录，核心结构如下，这里我们暂时不安装`vue-router、vuex`，从最简单的结构撸起

```bash
├── config
│   ├── webpack.common.js
│   ├── webpack.dev.js
│   └── webpack.prod.js
├── src
│   ├── assets
│   │   └── images
│   │       ├── bg-logo.png
│   │       ├── small-logo.jpg
│   ├── components
│   │   └── hello-webpack.vue
│   ├── app.vue
│   └── index.js
├── template
│   └── index.html
├── .gitignore
├── package.json
└── yarn.lock
```

## 二、基础代码

```html
<!-- template/index.html -->

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Webpack vue</title>
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>
```

```js
// src/app.vue

import Vue from 'vue';
import App from './app.vue';

new Vue({
    el: '#app',
    render: (h) => h(App),
});
```

```js
// src/index.js
<template>
    <div class="app-container">
        <h1>就算做咸鱼，也要比别的鱼咸一点</h1>
        <hello-webpack />
        <img :src="BigLogo" alt="">
        <img :src="SmallLogo" alt="">
    </div>
</template>

<script>
import HelloWebpack from '@/components/hello-webpack'
import BigLogo from '@/assets/images/big-logo.png'
import SmallLogo from '@/assets/images/small-logo.jpg'
export default {
    name: 'app',
    data() {
        return {
            BigLogo,
            SmallLogo
        }
    },
    components: {
        HelloWebpack
    }
}
</script>

<style>
    .app-container {
        background-color: #f1f1f1;
        color: #333;
    }
</style>
```

```js
// src/components/hello-webpack.vue
<template>
    <div class="hello-webpack-container">
       sub component say: hello, webpack+vue
    </div>
</template>

<script>
export default {
    name: 'hello-webpack'
}
</script>
```

相信有 vue 经验的同学对以上代码都非常熟悉了，不过要想跑起来，就需要写一些 webpack 配置了

## 三、webpack 环境配置总览

我们先列一下配置基础环境都要做哪些事情

顺便写一下最常见的包，这里肯定不全，不认识也没事，接下来一步步实践补齐

-   webpack：`webpack webpack-cli webpack-dev-server html-webpack-plugin webpack-merge`
-   处理 vue 单文件: `vue vue-loader vue-template-compiler`
-   支持高级 JS 语法: `babel-loader @babel/core @babel/preset-env`
-   处理 css、预处理器(less/sass/stylus): `css-loader style-loader less less-loader postcss-loader mini-css-extract-plugin autoprefixer`
-   处理图片、字体等文件:`url-loader file-loader`
-   代码风格+代码检测: `eslint prettier`

## 四、开发环境详细配置

### 4.1 webpack

[Getting Started | webpack](https://webpack.js.org/guides/getting-started/) 基础概念可以去官网先学习一波

```bash
# webpack核心包
yarn add -D webpack webpack-cli
yarn add -D webpack-merge cross-env webpack-dev-server html-webpack-plugin
```

-   `cross-env`：跨平台设置环境变量
-   `webpack-merge` : 合并配置用的
-   `webpack-dev-server`
    _ 作用：一个可以热更新的本地文件服务器
    _ 原理：通过 express 启动一个本地服务器，与客户端通过 websocket 进行长连接，可以通过配置 hot 属性来实现监听原始文件改变，实时编译刷新， \* 目前 vue-loader 内置了 JS 文件的 HMR 效果，css-loader 底层实现了各个模块之间联动的 hot module replacement，所以 webpack-dev-server 不需要再写额外的模块配置代码，就配置一个`hot`属性即可
-   `html-webpack-plugin` 打包结束后，自动生成 html 文件，并把打包后的 JS 自动引入 html 中（打了 hash 值的静态资源，手动引入会死人）
    [HtmlWebpackPlugin | webpack](https://webpack.js.org/plugins/html-webpack-plugin/#installation)
    [GitHub - html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)

按照国际惯例，我们先把 webpack 配置分成三份，在`config`目录下添加下面下面三份配置文件

-   `webpack.common.js`
-   `webpack.dev.js`
-   `webpack.prod.js`

用`cross-env`辅助区分环境，使用方法像这样，在`package.json`的`script`下设置

```json
"scripts": {
  "dev": "cross-env NODE_ENV=development webpack-dev-server --progress --config config/webpack.dev.js",
  "build": "cross-env NODE_ENV=production webpack --progress --config config/webpack.prod.js",
  "start": "node ./server.js"
},
```

`cross-env NODE_ENV=development`设置变量，然后在脚本或者 node 环境下能通过`process.env.NODE_ENV`获取环境变量，所以我们会在`webpack.common.js`里面配置如下

```js
module.exports = {
    mode: process.env.NODE_ENV,
};
```

等下下面写完配置后，然后一发 `yarn dev`，项目应该就能跑起来了

### 4.2 处理 vue 单文件

[起步 | Vue Loader](https://vue-loader.vuejs.org/zh/guide/)

```bash
# vue是在生产环境中要安装使用的，所以不加 -D 选项
yarn add vue
yarn add -D vue-loader vue-template-compiler
```

在 webpack 中配置

```js
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
    module: {
        rules: [
            // ... 其它规则
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
        ],
    },
    plugins: [
        // 请确保引入这个插件！
        new VueLoaderPlugin(),
    ],
};
```

### 4.3 支持高级 JS 语法（Babel）

```bash
yarn add -D babel-loader @babel/core @babel/preset-env
yarn add @babel/polyfill

# 下面这两货是一样的，只是一个用于生产环境，一个用于开发环境
yarn add @babel/runtime
yarn add -D @babel/plugin-transform-runtime

# 创建babel配置文件
touch .babelrc
```

-   `babel-loader` 把高级语法转为浏览器可以识别的语法
-   `@babel/preset-env` [@babel/preset-env · Babel](https://babeljs.io/docs/en/babel-preset-env) 最新 JS 语法预设
-   `@babel/polyfill` [@babel/polyfill · Babel](https://babeljs.io/docs/en/babel-polyfill) 有些低版本的浏览器连`promise/map`这些都没有，所以需要引入`@babel/polyfill`，但完整引入整个包又会很大，可通过`”useBuiltIns”: “usage”`配置为按需加载，或者手动引入需要的包
-   `babel-runtime`： 将开发者依赖的全局内置对象等，抽取成单独的模块，并通过模块导入（闭包）的方式引入，避免了对全局作用域的修改（污染）

`.babelrc`配置如下

```json
{
    "presets": [
        [
            "@babel/preset-env",
            {
                "useBuiltIns": "usage",
                "corejs": 3
            }
        ]
    ],
    "plugins": ["@babel/plugin-transform-runtime"]
}
```

### 4.4 处理 CSS、预处理器（Less/Sass/Stylus）

```bash
yarn add -D css-loader style-loader less less-loader mini-css-extract-plugin postcss-loader autoprefixer
```

-   `css-loader` 允许使用类似`@import`和`url（…）`的方法实现 require 的功能，将导入的`.css`文件处理成 JS 模块，但对页面还是没生效的
-   `style-loader`: 将上面`css-loader`处理好的样式打包到 JS 中，由 JS 将样式自动插入`head`的`style`标签
-   `mini-css-extract-plugin` 把 js 中 import 导入的样式文件代码，打包成一个实际的 css 文件，结合 `html-webpack-plugin`，在 html 中以 link 插入 css 文件；默认将 js 中 import 的多个 css 文件，打包时合成一个，在开发环境我们暂时不用它
-   `less-loader` 将 `.less`文件转成 `.css`文件
-   `postcss-loader` 它不算是 css 预编译器，而是一个编译插件的容器。主要是接收样式源代码，然后交给编译插件处理，最后输出 css。可以指定一些插件实现一些特定功能
-   `autoprefixer` 自动添加浏览器样式前缀，属于`PostCSS`的插件，需配合使用 [GitHub - postcss/autoprefixer: Parse CSS and add vendor prefixes to rules by Can I Use](https://github.com/postcss/autoprefixer#webpack)

这里要注意的时候，`rules`的执行顺序是：从下往上执行 、从右到左，所以要注意一下以上 loader 的顺序

上面这么几个估计已经把大伙儿搞懵逼了，这里我们先不管了，先把配置写了再来理解

```js
{
    test: /\.less$/,
    // 从下到上执行
    use: [
        'style-loader',
        {
            loader: 'css-loader',
            options: {
                // less里面直接@import其他的less文件的时候，直接走css-loader  会漏掉前面的两个loader
                importLoaders: 2, // 强制import要走前面的2个loader, postcss-loader和less-loader
                modules: true, // 样式模块化 CSS Module 防止样式冲突
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
            loader: 'css-loader',
            options: {
                importLoaders: 1,
                modules: true,
            },
        },
        'postcss-loader',
    ],
    exclude: /node_modules/,
},
```

```bash
# 增加一份postcss.config.js文件，用于给 postcss-loader添加插件配置
touch postcss.config.js
```

```js
// postcss.config.js 配置autoprefixer 插件
module.exports = {
    plugins: [require('autoprefixer')],
};
```

### 4.5 处理图片、字体等文件

```bash
yarn add -D url-loader file-loader
```

```js
{
    test: /\.(png|jpe?g|gif|svg)$/i,
    // url-loader works like file-loader, but can return a DataURL if the file is smaller than a byte limit.
    loader: 'url-loader',
    options: {
        limit: 2048, // 把小于这个size的文件打包成base64的格式，内嵌进代码里，可以省http请求去请求图片
        outputPath: 'images', // 大于limit值，图片会直接被放到这个文件夹，需要安装file-loader
        name: '[name]_[hash].[ext]',
    },
},
{
    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
    loader: 'url-loader',
},
```

### 4.6 `webpack-dev-server`+ `html-webpack-plugin` 让项目跑起来

先看`html-webpack-plugin`的配置，就是这么简单，啥也不说了

```js
// config/webpack.config.js
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
        new webpack.HotModuleReplacementPlugin(), // 配合 hot 属性模块热更新用的
        new FriendlyErrorsPlugin(),
    ],
});
```

### 4.7 配置代码与小结

`webpack.dev.js`的配置如上，这里再贴一发`webpack.common.js`的配置

```js
// config/webpack.common.js

const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

// 路径处理函数 减少路径书写:
// webpack里面的相对路径是以当前的配置文件为基准的，不是以根路径为准
const resolve = (dir) => path.join(__dirname, '..', dir);

module.exports = {
    mode: process.env.NODE_ENV,
    // 入口
    entry: {
        app: resolve('src/index.js'),
    },
    // 配置出口文件的地址
    output: {
        filename: '[name].[hash].js',
        path: resolve('dist'),
        // publicPath: '//s3.cdn.com',  添加文件的地址前缀(比如CDN)或者文件夹
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
                    outputPath: 'images', // 大于limit值，图片会直接被放到这个文件夹，需要安装file-loader
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
    plugins: [new VueLoaderPlugin()],
};
```

到这里为止 ，`yarn dev`启动服务，控制台输出如下就是成功了

```bash
   yarn dev

yarn run v1.22.4
$ cross-env NODE_ENV=development webpack-dev-server --progress --config config/webpack.dev.js
10% building 1/1 modules 0 activeℹ ｢wds｣: Project is running at http://localhost:8081/
ℹ ｢wds｣: webpack output is served from /
ℹ ｢wds｣: Content not from webpack is served from /Users/lgc/code-repo/webpack-repo/webpack-vue
98% after emitting

 DONE  Compiled successfully in 1574ms
```

[image:C542985E-BA92-4E1D-B333-35FEE4C647C6-330-0000795C40B4C619/0F9AEDDF-8D00-4C60-92BC-A60D27128AFF.png]

### 4.8 代码风格+代码错误检测+vsode 自动格式化（Eslint+Prettier）

项目能跑后，让我们再处理一下代码格式化相关
主要目的是：统一团队代码风格、提高代码质量、预解决低级错误

```bash
yarn add -D eslint prettier eslint-plugin-vue eslint-plugin-prettier eslint-config-prettier

# 新建以下配置文件，后面粘贴的代码规则是我个人常用的，自取修改即可
touch .editorconfig .eslintrc .eslintignore .prettierrc .prettierignore
```

-   [prettier](https://prettier.io/) （直译就是”更漂亮的“，不用多说了吧）：官方介绍 Prettier is an opinionated code formatter，大白话就是**代码格式化（美化）**
-   [eslint](https://eslint.org/) ：the pluggable linting utility for JavaScript and JSX，主要工作就是**检查代码质量并给出提示**，但它所能提供的格式化功能很有限，所以需要配合 Prettier
-   [eslint-plugin-vue](https://eslint.vuejs.org/rules/) : Official ESLint plugin for Vue.js，专为 vue 而生的 eslint 插件，eslint 主要对 js/jsx/ts 等文件进行检查，对.vue 文件能力有限，所以需要它的鼎力相助
-   [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier) 调用 prettier 规则对代码风格进行检查，让格式化后结果完全符合 Prettier 的要求
-   [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) 如果 eslint 和 prettier 的格式化规则冲突了，关闭 eslint 的这条规则，以 prettier 的为准

还有一个[eslint-loader](https://github.com/webpack-contrib/eslint-loader)，webpack 在打包时进行检测，属于强制型，如果规则配置的比较强，比如一个分号或者双引号的问题直接打包失败，会让部分同学非常抓狂，所以我们下面只是配置规则，让编辑器进行报错就好了（不喜欢的也可以关掉），开发自行校验，也暂时不加 git precommit 钩子来强制检测，有这部分需要的同学可以自行搜索添加

`.editorconfig`文件

```
# http://editorconfig.org
root = true

[*]
indent_style = space
indent_size = 4
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.{json,yaml}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

`.eslintrc`

```json
{
    "root": true,
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "globals": {
        "Vue": true
    },
    "extends": ["plugin:prettier/recommended", "plugin:vue/essential", "eslint:recommended"],
    "plugins": ["vue", "prettier"],
    "parserOptions": {},
    "rules": {
        "prettier/prettier": "error",
        "no-unused-vars": 1,
        "vue/no-unused-vars": 1,
        "vue/require-prop-types": 0,
        "vue/order-in-components": 0,
        "vue/valid-v-for": 1,
        "vue/require-v-for-key": 1,
        "vue/no-side-effects-in-computed-properties": 0,
        "vue/html-self-closing": 0,
        "vue/html-indent": ["error", 4],
        "vue/max-attributes-per-line": 0,
        "vue/singleline-html-element-content-newline": 0,
        "vue/html-closing-bracket-newline": [
            "error",
            {
                "singleline": "never",
                "multiline": "always"
            }
        ]
    }
}
```

`.eslintignore`

```
dist/
lib/
node_modules/

*.ts
*.html
*.ejs
```

`.prettierrc`文件

```json
{
    "trailingComma": "es5",
    "tabWidth": 4,
    "semi": true,
    "singleQuote": true,
    "printWidth": 120
}
```

`.prettierignore`

```
*.json
*.yaml
```

最后再来一份 vscode 的配置`.vscode/settings.json`，在每次保存代码的时候都会自动格式化代码

```json
{
    "editor.formatOnSave": true,
    "files.associations": {
        "*.vue": "vue"
    },
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    }
}
```

## 五、小结

到目前为止，我们已经完成了最基本的一个开发环境的搭建，代码我提交到 git 上面了，需要的同学可以自取

开发环境，是怎么爽怎么快就怎么来，到开发环境，我们要考虑的东西就会多一些，比如 css 提取压缩、code split、Tree Shaking、lazy-load、拆公共包、多入口等等，上面这份配置是远远不够的，我们下期再见
