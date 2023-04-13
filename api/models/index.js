const mongoose = require('mongoose');
const { Schema } = mongoose;
//创建Schema
const userSchema = new Schema({
    name: { type: String, index: { unique: true, dropDups: true } },
    sex: String,
    phone: String,
    date: { type: Date, default: Date.now },
    photos: [mongoose.Types.ObjectId]
})

const adminSchema = new Schema({
    username: String,
    password: String
})

const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);

module.exports = { User, Admin };