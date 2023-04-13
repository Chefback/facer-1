const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const express = require('express')
const app = express()
const initRoutes = require("./routes");
const config = require('./models/config')
const mongoose = require('mongoose')

app.use(bodyParser.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: "50mb"
}))
app.use(express.text());
app.use(cookieParser())
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE")
  res.header("Access-Control-Allow-Headers", "origin, content-type, Authorization")
  res.header("Content-Type", "application/json")
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next()
  }
})
const url = config.url + config.database
mongoose.Promise = global.Promise
mongoose.connect(url).then(() =>
  console.log("Successfully connect to MongoDB."))
  .catch((err) => console.log(err)
  )
// API routes
initRoutes(app)

module.exports = {
  path: '/',
  handler: app
}
