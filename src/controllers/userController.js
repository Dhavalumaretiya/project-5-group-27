const userModel = require("../models/userModel");
const awsConfig = require("../utils/aws");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ----------------------------------Validation---------------------------------------------------
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}


//-------------------------------------Create User--------------------------------------------------

const createUser = async function (req, res) {
    try {
        let requestBody = req.body;
        const saltRounds = 10;

        //Validation Start
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status:false, message: "Please enter details" })
        }

        //Extract Params
        const { fname, lname, email, password, phone } = requestBody

        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: 'First Name is required' })
        }

        if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: 'Last Name is required' })
        }

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: 'Email is required' })
        }
        //check for valid mail
        if (!email.match(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/)) {
            return res.status(400).send({ status: false, message: 'Invalid Mail' })
        }
        //check for unique mail
        const isEmailAlreadyUsed = await userModel.findOne({ email })
        if (isEmailAlreadyUsed) {
            return res.status(400).send({ status: false, message: 'This email is already registered' })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'Password is required' })
        }
        //check for password length
        if (!(password.trim().length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, message: 'Password should have length in range 8 to 15' })
        }
        // Bcrypt password
        requestBody.password = await bcrypt.hash(password, saltRounds)

        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: 'Phone no is required' })
        }
        //check for unique no
        const isNoAlreadyUsed = await userModel.findOne({ phone })
        if (isNoAlreadyUsed) {
            return res.status(400).send({ status: false, message: 'This phone no is Already registered' })
        }
        //check for valid no
        if (!(/^[6-9]\d{9}$/.test(phone))) {
            return res.status(400).send({ status: false, message: 'Invalid phone no.' })
        }

        let shipping = requestBody.address.shipping

        if (!isValid(shipping.street)) {
            return res.status(400).send({ status: false, message: 'Street is required' })
        }

        if (!isValid(shipping.city)) {
            return res.status(400).send({ status: false, message: 'City is required' })
        }

        if (!isValid(shipping.pincode)) {
            return res.status(400).send({ status: false, message: 'Pincode is required' })
        }

        let billing = requestBody.address.billing

        if (!isValid(billing.street)) {
            return res.status(400).send({ status: false, message: 'Street is required' })
        }

        if (!isValid(billing.city)) {
            return res.status(400).send({ status: false, message: 'City is required' })
        }

        if (!isValid(billing.pincode)) {
            return res.status(400).send({ status: false, message: 'Pincode is required' })
        }
        //Validation End

        //File-cloud Data for storing image
        let files = req.files

        if (!(files && files.length > 0))
            return res.status(400).send({ status: false, message: "No file found" });

        let uploadedFileURL = await awsConfig.uploadFile(files[0]);

        requestBody.profileImage = uploadedFileURL;

        const registerUser = await userModel.create(requestBody);

        res.status(201).send({ status: true, message: 'User created successfully', data: registerUser });

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}



//-------------------------------------User login--------------------------------------------------

const loginUser = async function (req, res) {
    try {
        let requestBody = req.body;

        //Extract Params
        let { email, password } = requestBody

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please enter details in body." })
        }
        //Validation start
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Please enter an email address." })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Please enter Password." })
        }

        let user = await userModel.findOne({ email });
        if (!user)
            return res.status(400).send({ status: false, message: "Login failed! Email  is incorrect." });

        let passwordInBody = user.password;
        let encryptPassword = await bcrypt.compare(password, passwordInBody);

        if (!encryptPassword) return res.status(400).send({ status: false, message: "Login failed! password is incorrect." });
        //Validation End

        let userId = user._id
        let token = jwt.sign(
            {
                userId: user._id.toString(),
                batch: "uranium",
                organisation: "FunctionUp",
            },
            "project-5-uranium",
            { expiresIn: "48h" }
        );

        res.setHeader("x-api-key", token);
        res.status(200).send({ status: true, message: 'Success', data: { userId, token } });

    } catch (err) {
        res.status(500).send({ message: "Server not responding", error: err.message });
    }
};

// --------------------------------------------------------------------------------

module.exports = { createUser, loginUser }