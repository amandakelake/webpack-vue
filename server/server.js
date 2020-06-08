const Koa = require('koa');
const path = require('path')
const app = new Koa();
const KoaStatic = require('koa-static');

app.use(KoaStatic(path.join( __dirname,  '../dist')))

app.listen(3000, () => {
    console.log('server start at http://localhost:3000')
})
