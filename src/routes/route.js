const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController");
const productController = require("../controllers/productController");
const auth = require("../middelware/auth")

// User APIs
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/user/:userId/profile', auth.auth,userController.getUser);
router.put('/user/:userId/profile', auth.auth,userController.updateUser);





module.exports = router; 