// 本文件为面部识别的控制api
const express = require('express')
const { writeFileSync } = require('fs')
const { join } = require('path')
const modelRoutes = express.Router()


//folders & model file
const rootFolder = join(__dirname, '../../')
const dataFolder = join(rootFolder, 'data')
const facesFileName = 'faces.json'

//传输脸部特征文件
modelRoutes.get("/getAll", (req, res) => {
  res.header("Content-Type", "application/json")
  const facesFile = join(dataFolder, facesFileName)
  console.log(facesFile)
  delete require.cache[facesFile]
  const result = require(facesFile)
  res.send(result);
})


//保存脸部特征文件
modelRoutes.post("/save", async (req, res) => {
  res.header("Content-Type", "application/json")
  const content = JSON.stringify(req.body.faces)
  writeFileSync(join(dataFolder, facesFileName), content)
  res.send('ok')
})

//传输注册脸部描述器
modelRoutes.get("/getDescriptor", async (req, res) => {
  res.header("Content-Type", "application/json")
  const content = JSON.stringify(req.body.faces)
  writeFileSync(join(dataFolder, facesFileName), content)
  res.send('ok')
})


module.exports = modelRoutes
