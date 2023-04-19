const { User } = require('../models')
const mongoose = require('mongoose')
const upload = require("./upload")

const config = require('../models/config');

const url = config.url + config.database;
const connect = mongoose.createConnection(url, { useNewUrlParser: true, useUnifiedTopology: true });

let gfs;

connect.once('open', () => {
    // initialize stream
    gfs = new mongoose.mongo.GridFSBucket(connect.db, {
        bucketName: config.imgBucket
    });
});


// Create and Save a new User
exports.create = async (req, res) => {
    res.header("Content-Type", "application/json")
    let newUser = new User(
        req.body
    );

    newUser.save()
        .then((user) => {
            res.status(200).json({
                success: true,
                user,
            });
        })
        .catch(err => res.status(500).json(err));
}

/**
 * Delete a user and all its photos 
 *
 * @param {*} req pass in username
 * @param {*} res send delete result
 */
exports.delete = async (req, res) => {
    const user = await User.findOneAndDelete({ name: req.body.user })
    const files = user.photos
    console.log(files.length)
    if (files.length != 0) {
        files.forEach((file) => {
            gfs.delete(file)
                .then(() => {
                    res.status(200).json({
                        success: true,
                        message: `File with ID ${file} of User ${user._id} is deleted`,
                    });
                })
                .catch(
                    (err => res.status(404).json({ err: err }))
                );
        })
    } else {
        res.status(200).json({
            success: true,
            message: `User with ID ${user._id} is deleted`,
        });
    }
};

exports.update = async (req, res) => {
    await User.findByIdAndUpdate(
        req.body._id, req.body.newdata, { new: true })
        .then((user) => {
            res.status(200).json({
                success: true,
                user,
            });
        })
        .catch((e) => res.status(500).json(e))
}

exports.upload = async (req, res) => {
    try {
        await upload(req, res).then(async () => {
            req.files.map(async (file) => {
                const fileid = new mongoose.Types.ObjectId(file.id)
                // const base64Data = file.buffer.toString('base64')
                // let newfile = new Image({
                //     filename: file.originalname,
                //     contentType: file.mimetype,
                //     data: base64Data
                // })

                await User.updateOne(
                    { name: req.body.user }, { $push: { photos: fileid } })
            })
            // newfile.save().then((photo) => {
            //     res.status(200).json(
            //         photo
            //     )
            // })
        });
        console.log(req.files, req.body.user);

        if (req.files == undefined) {
            return res.send({
                message: "You must select a file.",
            });
        }

        return res.send(req.files);
    } catch (error) {
        console.log(error);

        return res.send({
            message: "Error when trying upload image: ${error}",
        });
    }
}

// Retrieve all Users from the database.
exports.getAll = async (req, res) => {
    await User.find().then((users) => {
        return res.send(users)
    })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while deleting photos."
            });
        });
}

// exports.getPhoto = async (req, res) => {
//     await User.findOne(req.body.user).then((user) => {
//         user.photos.forEach((i) => {
//             gfs.find({ i })
//             cursor.forEach(file => gfs.delete(file._id))
//         })
//     })
//         .catch(err => {
//             res.status(500).send({
//                 message:
//                     err.message || "Some error occurred while deleting photos."
//             });
//         });
// }
exports.download = async (req, res) => {
    try {

        const fileid = new mongoose.Types.ObjectId(req.params.id)
        console.log(req.params)
        res.contentType('image/png');
        let downloadStream = await gfs.openDownloadStream(fileid)
        // res.pipe(downloadStream)
        downloadStream.on("data", function (data) {
            console.log(data)
            return res.status(200).write(data);
        });

        downloadStream.on("error", function (err) {
            return res.status(404).send({ message: "Cannot download the Image!" });
        });

        downloadStream.on("end", () => {
            return res.end();
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};



exports.deletePhoto = async (req, res) => {
    const fileid = new mongoose.Types.ObjectId(req.body.id)
    await User.updateOne({ name: req.body.user }, { $pull: { photos: fileid } })
    gfs.delete(fileid)
        .then(() => {
            res.status(200).json({
                success: true,
                message: `File with ID ${fileid} is deleted`,
            });
        })
        .catch(
            (err => res.status(404).json({ err: err }))
        );

}
