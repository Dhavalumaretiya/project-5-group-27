const express = require("express");
const router = express.Router();
const usercontroller = require("../Controllers/userController");

router.post("/register", usercontroller.createUser)



module.exports = router