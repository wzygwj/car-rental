const express = require('express')
const db = require('../mongoose')
const router = express.Router();

// 用户登录
router.post('/login', (req, res) => {
    db.User.find({ username: req.body.username }).count((err, count) => {
        if (err) {
            res.json({ code: 'error', message: '系统错误,请重试' })
        } else {
            if (count > 0) {
                db.User.findOne({ username: req.body.username }, (err, data) => {
                    if (req.body.password == data.password) {
                        res.cookie('user', data, { maxAge: 1000 * 60 * 60 })
                        res.json({ code: 'success', message: '登录成功' })
                    } else {
                        res.json({ code: 'error', message: '密码错误,请重新输入' })
                    }
                })
            } else {
                res.json({ code: 'error', message: '用户未注册,请注册' })
            }
        }
    })
})

// 用户注册
router.get('/register', (req, res) => {
    res.render('rent/register')
})
router.post('/register', (req, res) => {
    req.body.isAdmin = false;
    new db.User(req.body).save(err => {
        if (err) {
            res.json({ code: 'error', message: '系统错误' })
        }
        else {
            res.json({ code: 'success', message: '成功！' })
        }
    })
})

// 用户注销
router.get('/logout', (req, res) => {
    res.clearCookie('user');
    res.json({ code: 'success', message: '注销成功' })
})

// 联系我们
router.get('/contact', (req, res) => {
    new db.Contact(req.query).save(err => {
        if (err) {
            res.json({ code: 'error', message: '系统错误，提交失败！' })
        }
        else {
            res.json({ code: 'success', message: '提交成功！' })
        }
    })
})

// 查看预定车辆
router.get('/order/:id', (req, res) => {
    db.Order.findOne({ user: req.params.id }).populate("user").populate('car')
        .exec(function (err, data) {
            res.render('rent/order_info', { data: data })
        });

});

// 预定车辆
router.post('/order', (req, res) => {
    db.Order.find({ user: req.body.user }).count((err, count) => {
        if (err) {
            res.json({ code: 'error', message: '系统错误' })
        } else {
            if (count > 0) {
                res.json({ code: 'error', message: '已经预定车辆！' })
            } else {
                new db.Order(req.body).save(err => {
                    if (err) {
                        res.json({ code: 'error', message: '系统错误，提交失败！' })
                    }
                    else {
                        res.json({ code: 'success', message: '预定成功！' })
                    }
                })
            }
        }
    })
})

// 取消预定
router.get('/remove/order/:id', (req, res) => {
    db.Order.findByIdAndRemove(req.params.id, err => {
        if (err) {
            res.json({ code: 'error', message: '系统错误' });
        }
        else {
            res.json({ code: 'success', message: '取消成功！' });
        }
    })
})
module.exports = router;