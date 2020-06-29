# webpack 性能优化

来到本篇，相信大部分同学已经对 webpack 有了基础的理解和使用能力，具体使用就不再详细展开了，只讲讲思路

### 1、分析
* 官方基础分析stat.json
* 体积分析：[webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer) 模块体积分析
* 速度分析：[speed-measure-webpack-plugin](https://github.com/stephencookdev/speed-measure-webpack-plugin)  分析loader和plugin的执行时长，定位构建效率核心点

这些只是一次性的，可以单独搞一份 `webpack.analyse.config.js`配置，而不是每次都执行

### 2、优化方向
* 瘦身
	* 压缩：JS、CSS、图片
	* tree-shaking 按需加载：基于ES6 Modules的 `import/export`的语法
	* gzip压缩 `compression-webpack-plugin`
* 抽离
	* 拆包：webpack4默认自带`splitChunks`，可抽离公共模块
	* webpack-dll-plugin：单独将第三方库打到一个文件中，如果依赖没变化，不会重复静态编译构建
	* Externals(配合CDN，是更优秀的选择)：可将多个依赖库拆分，利用HTTP2的多路复用，即使是http1，也能利用网络进程的并发数
* 优化模块查找路径：`resolve` `include` `exclude`等全用上
* 缓存loader执行结果，加快编译速度：[cache-loader: Caches the result of following loaders on disk](https://github.com/webpack-contrib/cache-loader)
	* 但目前不建议把缓存逻辑集成到 CI 流程中，可能会出现更新依赖后依旧命中缓存的情况，开发机可以手动删除缓存，但编译机就麻烦得多了，CI过程还是建议保留纯净，其实不太在意这点速度
* 多线程编译：
	* [happypack](https://github.com/amireh/happypack)，利用系统CPU多核能力开启多线程，貌似webpack5已经开启了
	* [thread-loader: Runs the following loaders in a worker pool](https://github.com/webpack-contrib/thread-loader) 某些loader不支持happypack，比如`vue-loader`，就可以利用`thread-loader`
