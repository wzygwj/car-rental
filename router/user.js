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
                        res.cookie('username', data.username, { maxAge: 1000000 })
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
    res.clearCookie('username');
    res.json({ code: 'success', message: '注销成功' })
})

module.exports = router;