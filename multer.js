const multer = require('multer')

const storage = multer.diskStorage({
    destination: 'wwwroot/images/cars',
    filename: function (req, file, callback) {
        callback(null, `${req.body.name}.jpg`)
    }
})

module.exports = multer({ storage })