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
module.exports = router;