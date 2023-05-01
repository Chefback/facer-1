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
    console.log(req.body)
    res.header("Content-Type", "application/json")
    let newUser = new User(
        req.body.user
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

exports.delete = async (req, res) => {
    const user = await User.findOneAndDelete({ name: req.body.user })
    const files = user.photos
    console.log(files.length)
    if (files.length != 0) {
        files.forEach((file) => {
            gfs.remove(file)
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
    console.log(req.body)
    await User.findByIdAndUpdate(
        req.body.user._id, req.body.user, { new: true })
        .then((user) => {
            console.log(user)
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

                await User.updateOne(
                    { name: req.body.user }, { $push: { photos: fileid } })
            })
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

exports.download = async (req, res) => {

    const file_id = new mongoose.Types.ObjectId(req.params.file)

    const files = await gfs.find({ _id: file_id }).toArray()
    if (!files || files.length === 0) {
        return res.status(200).json({
            success: false,
            message: 'No files available'
        });
    }
    if (files[0].contentType === 'image/jpeg' || files[0].contentType === 'image/png' || files[0].contentType === 'image/svg+xml') {
        // render image to browser
        res.type(files[0].contentType)
        gfs.openDownloadStream(file_id).pipe(res);
    } else {
        res.status(404).json({
            err: 'Not an image',
        });
    }
    console.log(files, 'single_file')
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
