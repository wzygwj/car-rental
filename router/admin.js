const express = require('express')
const db = require('../mongoose')
const upload = require('../multer')
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
// 管理员首页
router.get('/', (req, res) => {
    res.render('back/index')
})
// 登录
router.get('/login', (req, res) => {
    res.render('back/login')
})
router.post('/login', (req, res) => {
    db.User.find({ username: req.body.username }).count((err, count) => {
        if (err) {
            res.json({ code: 'error', message: '系统错误,请重试' })
        } else {
            if (count > 0) {
                db.User.findOne({ username: req.body.username }, (err, data) => {
                    // 判断是否为管理员
                    if (data.isAdmin) {
                        if (req.body.password == data.password) {
                            res.cookie('username', data.username, { maxAge: 1000000 })
                            res.json({ code: 'success', message: '登录成功' })
                        } else {
                            res.json({ code: 'error', message: '密码错误,请重新输入' })
                        }
                    } else {
                        res.json({ code: 'error', message: '此用户不是管理员' })
                    }

                })
            } else {
                res.json({ code: 'error', message: '用户未注册,请注册' })
            }
        }
    })
})
// 添加用户
router.get('/user/add', (req, res) => {
    res.render('back/user/add')
})
router.post('/user/add', (req, res) => {
    new db.User(req.body).save(err => {
        if (err) {
            res.json({ code: 'error', message: '系统错误' })
        }
        else {
            res.json({ code: 'success', message: '成功！' })
        }
    })
})
// 用户列表
router.get('/user/list/(:page)?', (req, res) => {
    // 空对象
    var filter = {}
    // 获取要搜索的学生姓名
    var name = req.body.name
    // 如果name有值的话
    if (name) {
        // 去除前后空格
        name = name.trim()
        if (name.length > 0) {
            filter.name = {
                '$regex': `.*?${name}.*?`
                // 正则表达式：
                // .表示除回车换行外的任意字符
                // *表示0个或多个
                // ?表示可以有也可以没有
            }
        }
    }

    // 空对象,存放排序后的学生信息
    var order = {}
    // 向order中放入一对值,
    // 属性名是:req.body.sortProperty
    // 属性值是:req.body.sortDir
    order[req.body.sortProperty] = req.body.sortDir
    // 使用[]为对象创建属性，属性名是[]内表达式的值
    // 如：req.body.sortProperty是值是createTime，则相当于：
    // order.createTime = 1

    // page表示当前显示的是第几页
    var page = req.params.page

    page = page || 1
    page = parseInt(page)

    // 规定每页显示5条学生信息
    var pageSize = 5

    // find()是mongoose中的方法
    db.User.find().count((err, total) => {
        if (err) {
            res.json({ code: 'error', message: '系统错误！' })
        }
        else {
            // 得到一共有几页
            var pageCount = Math.ceil(total / pageSize)
            if (page > pageCount) page = pageCount
            if (page < 1) page = 1
            // 查找学生信息并排序
            // sort()是排序函数
            db.User.find().skip((page - 1) * pageSize).limit(pageSize)
                .exec((err, data) => {
                    if (err) {
                        res.json({ code: 'error', message: '系统错误！' })
                    }
                    else {
                        res.render('back/user/list', {
                            page,
                            pageCount,
                            // 调用getPages
                            pages: getPages(page, pageCount),
                            users: data.map(m => {
                                m = m.toObject()
                                m.id = m._id.toString()
                                delete m._id
                                return m;
                            })
                        })
                    }
                })
        }
    })
})
// 删除用户
router.get("/user/del/(:id)?", (req, res) => {
    db.User.findByIdAndRemove(req.params.id, err => {
        if (err) {
            res.json({ code: 'error', message: '系统错误' });
        }
        else {
            res.json({ code: 'success', message: '成功！' });
        }
    })
})
// 编辑用户
router.get('/user/edit/:id', (req, res) => {
    db.User.findById(req.params.id, (err, data) => {
        if (err) {

        } else {
            var user = data.toObject();
            user.id = data._id.toString()
            delete user._id
            res.render('back/user/edit', { user })
        }
    })
})
router.post('/user/edit/:id', (req, res) => {
    db.User.findByIdAndUpdate(req.params.id, req.body, err => {
        if (err) {
            res.json({ code: 'error', message: '系统错误' });
        }
        else {
            res.json({ code: 'success', message: '成功！' });
        }
    })
})

// 添加汽车
router.get('/car/add', (req, res) => {
    res.render('back/car/add')
})
router.post('/car/add', upload.single('pic'), (req, res) => {
    req.body.picture = req.file.filename
    new db.Car(req.body).save(err => {
        if (err) {
            res.json({ code: 'error', message: '系统错误' })
        }
        else {
            res.json({ code: 'success', message: '成功！' })
        }
    })
})
// 车辆列表
router.get('/car/list/(:page)?', (req, res) => {
    // page表示当前显示的是第几页
    var page = req.params.page

    page = page || 1
    page = parseInt(page)

    // 规定每页显示5条信息
    var pageSize = 5

    db.Car.find().count((err, total) => {
        if (err) {
            res.json({ code: 'error', message: '系统错误！' })
        }
        else {
            // 得到一共有几页
            var pageCount = Math.ceil(total / pageSize)
            if (page > pageCount) page = pageCount
            if (page < 1) page = 1
            db.Car.find().skip((page - 1) * pageSize).limit(pageSize)
                .exec((err, data) => {
                    if (err) {
                        res.json({ code: 'error', message: '系统错误！' })
                    }
                    else {
                        res.render('back/car/list', {
                            page,
                            pageCount,
                            // 调用getPages
                            pages: getPages(page, pageCount),
                            cars: data.map(m => {
                                m = m.toObject()
                                m.id = m._id.toString()
                                delete m._id
                                return m;
                            })
                        })
                    }
                })
        }
    })
})
// 删除车辆
router.get("/car/del/(:id)?", (req, res) => {
    db.Car.findByIdAndRemove(req.params.id, err => {
        if (err) {
            res.json({ code: 'error', message: '系统错误' });
        }
        else {
            res.json({ code: 'success', message: '成功！' });
        }
    })
})
// 编辑车辆
router.get('/car/edit/:id', (req, res) => {
    db.Car.findById(req.params.id, (err, data) => {
        if (err) {

        } else {
            var car = data.toObject();
            car.id = data._id.toString()
            delete car._id
            res.render('back/car/edit', { car })
        }
    })
})
router.post('/car/edit/:id', upload.single('pic'), (req, res) => {
    if (req.file) {
        req.body.picture = req.file.filename;
    }
    db.Car.findByIdAndUpdate(req.params.id, req.body, err => {
        if (err) {
            res.json({ code: 'error', message: '系统错误' });
        }
        else {
            res.json({ code: 'success', message: '成功！' });
        }
    })
})

// 订单管理
router.get('/order/list/(:page)?', (req, res) => {
    // page表示当前显示的是第几页
    var page = req.params.page

    page = page || 1
    page = parseInt(page)

    // 规定每页显示5条信息
    var pageSize = 5

    db.Order.find().count((err, total) => {
        if (err) {
            res.json({ code: 'error', message: '系统错误！' })
        }
        else {
            // 得到一共有几页
            var pageCount = Math.ceil(total / pageSize)
            if (page > pageCount) page = pageCount
            if (page < 1) page = 1
            db.Order.find().populate("user car").skip((page - 1) * pageSize).limit(pageSize)
                .exec((err, data) => {
                    if (err) {
                        res.json({ code: 'error', message: '系统错误！' })
                    }
                    else {
                        res.render('back/order/list', {
                            page,
                            pageCount,
                            // 调用getPages
                            pages: getPages(page, pageCount),
                            orders: data
                        })
                    }
                })
        }
    })
})

// 编辑订单
router.get('/order/edit/:id', (req, res) => {
    db.Order.findById(req.params.id, (err, data) => {
        if (err) {

        } else {
            res.render('back/order/edit', { order: data })
        }
    })
})
router.post('/order/edit/:id', (req, res) => {
    db.Order.findByIdAndUpdate(req.params.id, req.body, err => {
        if (err) {
            res.json({ code: 'error', message: '系统错误' });
        }
        else {
            res.json({ code: 'success', message: '成功！' });
        }
    })
})
module.exports = router;