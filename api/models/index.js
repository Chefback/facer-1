const mongoose = require('mongoose');
const { Schema } = mongoose;
//创建Schema
const imgSchema = new Schema({
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    data: { type: String, required: true },
}, { timestamps: true })

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
const Image = mongoose.model('Image', imgSchema);

module.exports = { User, Admin };