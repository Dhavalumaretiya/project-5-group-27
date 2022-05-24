const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController");

// User APIs
router.post('/register', userController.createUser)
router.post('/login', userController.loginUser)



module.exports = router; 