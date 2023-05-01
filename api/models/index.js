const mongoose = require('mongoose');
const { Schema } = mongoose;
//创建Schema

const userSchema = new Schema({
    name: { type: String, index: { unique: true, dropDups: true } },
    sex: String,
    phone: String,
    photos: [mongoose.Types.ObjectId]
}, { timestamps: true })

const adminSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true })


const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);

module.exports = { User, Admin };