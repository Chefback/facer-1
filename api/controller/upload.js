const util = require("util");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const dbConfig = require("../models/config");

var storage = new GridFsStorage({
    url: dbConfig.url + dbConfig.database,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        const match = ["image/png", "image/jpeg"];
        if (match.indexOf(file.mimetype) === -1) {
            const filename = `${Date.now()}-${req.body.user}-${file.originalname}`;
            return filename;
        }
        console.log(req.body.user, 'userid')
        return {
            bucketName: dbConfig.imgBucket,
            filename: `${Date.now()}-${req.body.user}-${file.originalname}`,
        };
    },
});

var uploadFiles = multer({ storage: storage }).array("fileUpload");
var uploadFilesMiddleware = util.promisify(uploadFiles);
module.exports = uploadFilesMiddleware;