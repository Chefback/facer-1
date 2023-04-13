const express = require('express')
const modelRoutes = express.Router()

modelRoutes.post('/login', (res, req) => {
    res.header("Content-Type", "application/json")

})

modelRoutes.post('/signup', (res, req) => {
    res.header("Content-Type", "application/json")
})
module.exports = modelRoutes