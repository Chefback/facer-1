const express = require("express");
const router = express.Router();
const userController = require("../controller/user");

let routes = app => {
    //user info update
    router.post("/user/create", userController.create);
    router.post("/user/delete", userController.delete);
    router.post("/user/update", userController.update);
    //upload user photo 
    router.post("/user/upload", userController.upload);
    // photos
    router.get("/user/getAll", userController.getAll);
    router.post("/user/deletePhoto", userController.deletePhoto);

    return app.use("/api", router);
};

module.exports = routes;