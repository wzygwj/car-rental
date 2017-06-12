const express = require('express')
const db = require('../mongoose')
const router = express.Router();

// getPages()的作用是得到一共有几页  
function getPages(page, pageCount) {
    var pages = [page]
    // 左边的第1个页码
    var left = page - 1
    // 右边的第1个页码
    var right = page + 1
    while (pages.length < 11 && (left >= 1 || right <= pageCount)) {
        if (left > 0) pages.unshift(left--)
        if (right <= pageCount) pages.push(right++)
    }
    return pages
}
// 获取车辆信息，display：跳转的页面，size：获取数量
router.get('/list/:display/:size/(:page)?', (req, res) => {
    // page表示当前显示的是第几页
    var page = req.params.page
    page = page || 1
    page = parseInt(page)

    // /list/slider?type=test
    // req.query.type='test'

    // // post请求
    // req.body.type

    // /list/test/1/1
    // req.params.display='tets'

    var pageSize = req.params.size
    pageSize = parseInt(pageSize)

    db.Car.find().count((err, total) => {
        if (err) {
            res.json({ code: 'error', message: '系统错误！' })
        }
        else {
            // 得到一共有几页
            var pageCount = Math.ceil(total / pageSize)
            if (page > pageCount) page = pageCount
            if (page < 1) page = 1
            db.Car.find().skip((page - 1) * pageSize).limit(pageSize).exec((err, data) => {
                res.render('rent/' + req.params.display, {
                    page,
                    pageCount,
                    // 调用getPages
                    pages: getPages(page, pageCount),
                    cars: data
                });
            })
        }
    })
})

// 车辆详情页面 
router.get('/one/:id', (req, res) => {
    db.Car.findById(req.params.id, (err, data) => {
        if (err) {
            console.log(err)
        } else {
            res.render('rent/one', { car: data })
        }
    })
})

// 获取预定车辆信息
router.get('/order_info/:id', (req, res) => {
    db.Car.findById(req.params.id, (err, data) => {
        console.log(data)
        if (err) {
            console.log(err)       
        } else {            
            res.render('rent/order', { car: data })        
        }
    })
})

// 联系我们
router.get('/contact', (req, res) => {
    res.render('rent/contact')
})

// 搜索
router.get('/search', (req, res) => {
    // /list/slider?type=test
    // req.query.type='test'

    // // post请求
    // req.body.type = '1'

    // /list/test/1/1
    // req.params.display='tets'
    var filter = {};
    var name = req.query.name;
    var type = req.query.type;
    if (name) {
        name = name.trim();
        if (name.length > 0) {
            filter.name = { '$regex': `.*${name}.*?` }
        }
    }
    if (type && type != 'undefined') {
        type = type.trim();
        if (type.length > 0) {
            filter.type = { '$regex': `.*${type}.*?` }
        }
    }
    db.Car.find(filter).exec((err, data) => {
        res.render('rent/search', {
            cars: data
        });
    })
})
module.exports = router;