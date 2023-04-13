const {
    lstatSync,
    readFileSync,
    readdirSync,
    writeFile,
    unlinkSync
} = require('fs')
const {
    join
} = require('path')
const rimraf = require('rimraf')
const sharp = require('sharp')
sharp.cache(false)
const multer = require("multer")
const rootFolder = join(__dirname, '../../')
const dataFolder = join(rootFolder, 'data')
const usersFolder = join(dataFolder, 'users')
//设置存储
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, usersFolder)
    },
    filename: function (req, file, callback) {
        let fileComponents = file.originalname.split(".")
        let fileExtension = fileComponents[fileComponents.length - 1]
        let filename = `${req.body.user}_${Date.now()}.${fileExtension}`
        callback(null, filename)
    }
})

//获取用户图片函数
const getUserPhotos = (user) => {
    const userFolder = join(usersFolder, user)
    const isFile = source => !lstatSync(source).isDirectory()
    const getFiles = source => readdirSync(source)
        .map(name => join(source, name))
        .filter(isFile)
        .map(name => {
            let photo = name.replace(rootFolder, '').replace(/\\/g, '/')
            return !photo.startsWith('/') ? '/' + photo : photo
        })
    const result = getFiles(userFolder)
    return result;
}

//上传文件函数
async function uploadFile(upload, req, res) {
    return new Promise(async (resolve, reject) => {
        await upload(req, res, async (err) => {
            if (err) {
                reject(new Error('Error uploading file'))
                return
            }

            const result = [];
            await Promise.all(req.files.map(async file => {
                User.find({ where: { name: req.body.user } })
                    .then((user) => {
                        Faces.create({
                            userId: user.id,
                            filename: file.filename
                        })
                    })
                    .then(async () => {
                        const oldPath = join(usersFolder, file.filename)
                        const newPath = join(usersFolder, req.body.user, file.filename)
                        const buffer = readFileSync(oldPath)

                        await sharp(buffer)
                            .resize(320, 247)
                            .toFile(newPath)
                            .then(() => {
                                result.push(`/data/users/${req.body.user}/${file.filename}`)
                                try {
                                    unlinkSync(oldPath)
                                } catch (ex) {
                                    console.log(ex)
                                }
                            })
                    })
                    .catch((err) => {
                        reject(e)
                        return
                    });
                // //读取旧目录的图片并进行修改，修改完后保存到新目录，并删除旧文件
                // try {
                //     const oldPath = join(usersFolder, file.filename)
                //     const newPath = join(usersFolder, req.body.user, file.filename)
                //     const buffer = readFileSync(oldPath)

                //     await sharp(buffer)
                //         .resize(320, 247)
                //         .toFile(newPath)
                //         .then(() => {
                //             result.push(`/data/users/${req.body.user}/${file.filename}`)
                //             try {
                //                 unlinkSync(oldPath)
                //             } catch (ex) {
                //                 console.log(ex)
                //             }
                //         })
                // } catch (e) {
                //     reject(e)
                //     return
                // }
            }))
            resolve(result)
        })
    })
}

//上传base64
async function uploadBase64(upload) {
    //从接收到的dataurl获取data,并将接收到data写为文件
    const fileName = `${upload.user}_${Date.now()}.jpg`
    const imgPath = join(usersFolder, upload.user, fileName)
    const content = upload.content.split(',')[1]
    return new Promise(async (resolve, reject) => {
        writeFile(imgPath, content, 'base64', (err) => {
            if (err) {
                reject(new Error(err))
            }
            resolve([upload.user, `/data/users/${upload.user}/${fileName}`])
        })
    })
}

//删除文件夹
async function deleteFolder(name) {
    return new Promise(async (resolve, reject) => {
        rimraf(name, (err) => {
            if (err) {
                reject(new Error(err))
            }
            resolve()
        })
    })
}
module.exports = { getUserPhotos, uploadBase64, uploadFile, deleteFolder }