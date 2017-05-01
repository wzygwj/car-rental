const express = require('express')
const db = require('../mongoose')
const router = express.Router();

// 获取车辆信息，page：跳转的页面，size：获取数量
router.get('/list/:page/:size', (req, res) => {
    db.Car.find().limit(parseInt(req.params.size)).exec((err, data) => {
        res.render('rent/' + req.params.page, {
            cars: data
        });
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

// 联系我们
router.get('/contact', (req, res) => {
    res.render('rent/contact')
})

module.exports = router;