const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rent');
const db = mongoose.connection;
// 数据库连接失败的提示
db.on('error', err => console.error('数据库连接失败：', err));
// 数据库连接成功的提示
db.on('open', () => console.log('成功打开数据库'));

const User = mongoose.model('users', {
    username: { type: String, unique: true },
    name: String,
    password: String,
    phone: String,
    email: String,
    isAdmin: Boolean,
    address: String
});

const Car = mongoose.model('car', {
    name: { type: String, unique: true },
    price: Number,
    type: String,
    desc: String,
    picture: String
})
module.exports = { User, Car };
