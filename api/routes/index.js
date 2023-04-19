const express = require("express");
const admin = require('../controller/admin')
const router = express.Router();
const userController = require("../controller/user");
const passport = require('passport')
// api/routes/authentication.js


let routes = app => {
    //user info update
    router.post("/user/create", userController.create);
    router.post("/user/delete", userController.delete);
    router.post("/user/update", userController.update);
    //upload user photo 
    router.post("/user/upload", userController.upload);
    // photos
    router.get("/user/getAll", userController.getAll);
    router.get("/user/:name/:file", userController.download);

    router.post("/user/deletePhoto", userController.deletePhoto);

    router.post('/auth/login', async (req, res) => {
        passport.authenticate('local', { session: false }, (err, user, message) => {
            if (err) {
                console.log(err)
                // you should log it
                return res.status(500).send(err)
            } else if (!user) {
                // you should log it
                return res.status(403).send(message)
            } else {
                const token = admin.signAdminToken(user)
                return res.status(200).send({ token, user })
            }
        })(req, res)
    })

    router.get('/auth/user', async (req, res) => {
        passport.authenticate('jwt', { session: false }, (err, user, message) => {
            if (err) {
                // you should log it
                return res.status(400).send(err)
            } else if (!user) {
                // you should log it
                return res.status(403).send({ message })
            } else {
                return res.send({ user })
            }
        })(res, req)
    })

    router.post('/auth/register', async (req, res) => {

        const password = req.body.password
        const username = req.body.name
        const hashedPassword = await admin.generatePasswordHash(password)

        await admin.CreateAdmin(username, hashedPassword)
            .then(() => {
                res.status(200).json({ message: 'An account has been created!' })
            }).catch((err) => {
                // throw err
                res.status(500).json({ message: `Account ${err.keyValue.username} has been created!` })
            })
    })

    router.use('/face', require('../controller/face-controller'))
    return app.use("/api", router);
};

module.exports = routes;