const express = require('express')
const db = require('../mongoose')
const router = express.Router();

router.get('/slider', (req, res) => {
    db.Car.find().limit(5).exec((err, data) => {
        res.render('rent/slider', {
            cars: data
        });
    })
})
router.get('/hot', (req, res) => {
    db.Car.find().limit(6).exec((err, data) => {
        res.render('rent/hot', {
            cars: data
        });
    })
})
module.exports = router;