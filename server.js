// const 声明创建一个只读的常量。常量的值不能通过再赋值改变。
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const app = express()

//设置静态文件目录
app.use(express.static('wwwroot'))

// 使用模板引擎art-template
const template = require('art-template')
template.config('extname', '.html');
app.engine('.html', template.__express);
app.set('view engine', 'html');

//  使用body-parser模块，当客户端发送post请求时，body-parser能够将
//  请求体中的参数解析为对象。
app.use(bodyParser.urlencoded({ extended: true }))

// 使用中间件cookieParser
app.use(cookieParser())

// 首页
app.get('/', (req, res) => {
    res.render('rent/index')
})

// 管理员
app.use('/admin', require("./router/admin"))

app.listen(3000, () => console.log('Server runing at port 3000.'))