const userModel = require("../models/userModel");
const awsConfig = require("../utils/aws");
const validator = require("../utils/validation")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//-------------------------------------Create User-----------------------------------------------------

const createUser = async function (req, res) {
    try {
        let requestBody = req.body;
        const saltRounds = 10;

        //Validation Start
        if (!validator.validRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please enter details" })
        }

        //Extract Params
        const { fname, lname, email, password, phone } = requestBody

        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, message: 'First Name is required' })
        }

        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: 'Last Name is required' })
        }

        if (!validator.isValid(email)) {
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

        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: 'Password is required' })
        }
        //check for password length
        if (!(password.trim().length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, message: 'Password should have length in range 8 to 15' })
        }
        // Bcrypt password
        requestBody.password = await bcrypt.hash(password, saltRounds)

        if (!validator.isValid(phone)) {
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

        if (!validator.isValid(shipping.street)) {
            return res.status(400).send({ status: false, message: 'Street is required' })
        }

        if (!validator.isValid(shipping.city)) {
            return res.status(400).send({ status: false, message: 'City is required' })
        }

        if (!validator.isValid(shipping.pincode)) {
            return res.status(400).send({ status: false, message: 'Pincode is required' })
        }

        let billing = requestBody.address.billing

        if (!validator.isValid(billing.street)) {
            return res.status(400).send({ status: false, message: 'Street is required' })
        }

        if (!validator.isValid(billing.city)) {
            return res.status(400).send({ status: false, message: 'City is required' })
        }

        if (!validator.isValid(billing.pincode)) {
            return res.status(400).send({ status: false, message: 'Pincode is required' })
        }
        //Validation End

        // Uplode image
        let files = req.files;

        if (!(files && files.length > 0))
            return res.status(400).send({ status: false, message: "No file found" });

        let uploadedFileURL = await awsConfig.uploadFile(files[0]);

        requestBody.profileImage = uploadedFileURL;


        const registerUser = await userModel.create(requestBody);

        res.status(201).send({ status: true, message: 'User created successfully', userId: registerUser });

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}



//-------------------------------------User login--------------------------------------------------------

const loginUser = async function (req, res) {
    try {
        let requestBody = req.body;

        //Extract Params
        let { email, password } = requestBody

        if (!validator.validRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please enter details in body." })
        }
        //Validation start
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "Please enter an email address." })
        }

        if (!validator.isValid(password)) {
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
        // create token
        let token = jwt.sign(
            {
                userId: user._id.toString(),
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60
            },
            'project-5-Products_Management'
        )

        res.status(200).send({ status: true, message: 'Success', userId: { userId, token } });

    } catch (err) {
        res.status(500).send({ message: "Server not responding", error: err.message });
    }
};

//-------------------------------------get User profile----------------------------------------------------

const getUser = async function (req, res) {
    try {
        let userId = req.params.userId;
        let userIdfromToken = req.userId;

        //Validation start
        if (!validator.vaildObjectId(userId))
            return res.status(400).send({ status: false, message: "Please enter vaild User id in params." });
        //Validation End

        let fetchUserData = await userModel.findOne({ _id: userId }).select({ address: 1, _id: 1, fname: 1, lname: 1, email: 1, profileImage: 1, phone: 1, password: 1, createdAt: 1, updatedAt: 1, __v: 1 })
        if (!fetchUserData) {
            return res.status(400).send({ status: false, message: "User not found." });
        }

        if (fetchUserData._id.toString() != userIdfromToken) {
            res.status(401).send({ status: false, message: "Unauthorized access!!" });
        }
        res.status(200).send({ status: true, message: 'User profile details.', userId: fetchUserData });

    } catch (err) {
        res.status(500).send({ message: "Server not responding", error: err.message });
    }
};

//-------------------------------------update User profile----------------------------------------------------

const updateUser = async function (req, res) {
    try {
        let updateData = req.body;
        let userId = req.params.userId;
        let userIdfromToken = req.userId;
        let files = req.files;

        //Validation start
        if (!validator.vaildObjectId(userId))
            return res.status(400).send({ status: false, message: "Please enter vaild User id in params." });

        if (!validator.validRequestBody(updateData)) {
            return res.status(400).send({ status: false, message: "Invaild request parameters.please provides a details" })
        }

        let findUser = await userModel.findOne({ _id: userId })
        if (!findUser) {
            return res.status(400).send({ status: false, message: "User not found." });
        }

        if (findUser._id.toString() != userIdfromToken) {
            res.status(401).send({ status: false, message: "Unauthorized access!!" });
        }

        //Extract Params
        let { fname, lname, email, profileImage, phone, password, address } = updateData 

        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, message: 'First Name is required' })
        }

        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: 'Last Name is required' }) 
        }

        if (!validator.isValid(email)) {
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

        //check for unique no
        const isNoAlreadyUsed = await userModel.findOne({ phone })
        if (isNoAlreadyUsed) {
            return res.status(400).send({ status: false, message: 'This phone no is Already registered' })
        }
        //check for valid no
        if (!(/^[6-9]\d{9}$/.test(phone))) {
            return res.status(400).send({ status: false, message: 'Invalid phone no.' })
        }

        let pass = password
        if (!validator.isValid(pass)) {
            return res.status(400).send({ status: false, message: 'Password is required' })
        }
        //check for password length
        if (!(pass.trim().length >= 8 && pass.length <= 15)) {
            return res.status(400).send({ status: false, message: 'Password should have length in range 8 to 15' })
        }
        // Bcrypt password
        let encryptpassword = await bcrypt.hash(pass, 10)

        // Shipping Address 
        if (address) {

            let shippingAddresstoString = JSON.stringify(address);
            let stringtoObject = JSON.parse(shippingAddresstoString);

            if (validator.validRequestBody(stringtoObject)) {
                if (stringtoObject.hasOwnProperty('shipping')) {
                    if (stringtoObject.shipping.hasOwnProperty('street')) {
                        if (!validator.isValid(stringtoObject.shipping.street)) {
                            return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide shipping address's Street" });
                        }
                    }
                    if (stringtoObject.shipping.hasOwnProperty('city')) {
                        if (!validator.isValid(stringtoObject.shipping.city)) {
                            return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide shipping address's City" });
                        }
                    }
                    if (stringtoObject.shipping.hasOwnProperty('pincode')) {
                        if (!validator.isValid(stringtoObject.shipping.pincode)) {
                            return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide shipping address's pincode" });
                        }
                    }

                    //using var to use these variables outside this If block.
                    var shippingStreet = address.shipping.street
                    var shippingCity = address.shipping.city
                    var shippingPincode = address.shipping.pincode
                }
            } else {
                return res.status(400).send({ status: false, message: " Invalid request parameters. Shipping address cannot be empty" });
            }
        }

        // Billing Address

        if (address) {

            //converting billing address to string them parsing it.
            let billingAddressToString = JSON.stringify(address)
            let parsedBillingAddress = JSON.parse(billingAddressToString)

            if (validator.validRequestBody(parsedBillingAddress)) {
                if (parsedBillingAddress.hasOwnProperty('billing')) {
                    if (parsedBillingAddress.billing.hasOwnProperty('street')) {
                        if (!validator.isValid(parsedBillingAddress.billing.street)) {
                            return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide billing address's Street" });
                        }
                    }
                    if (parsedBillingAddress.billing.hasOwnProperty('city')) {
                        if (!validator.isValid(parsedBillingAddress.billing.city)) {
                            return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide billing address's City" });
                        }
                    }
                    if (parsedBillingAddress.billing.hasOwnProperty('pincode')) {
                        if (!validator.isValid(parsedBillingAddress.billing.pincode)) {
                            return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide billing address's pincode" });
                        }
                    }

                    //using var to use these variables outside this If block.
                    var billingStreet = address.billing.street
                    var billingCity = address.billing.city
                    var billingPincode = address.billing.pincode
                }
            } else {
                return res.status(400).send({ status: false, message: " Invalid request parameters. Billing address cannot be empty" });
            }
        }

        if (files) {
            if (validator.isValid(files)) {
                if (!(files && files.length > 0)) {
                    return res.status(400).send({ status: false, message: "No file found" });
                }
                var uploadedFileURL = await awsConfig.uploadFile(files[0]);
            }
        }

        //Validation end

        let updateUserData = await userModel.findOneAndUpdate({ _id: userId }, {

            $set: {
                fname: fname,
                lname: lname,
                email: email,
                profileImage: uploadedFileURL,
                phone: phone,
                password: encryptpassword,
                'address.shipping.street': shippingStreet,
                'address.shipping.city': shippingCity,
                'address.shipping.pincode': shippingPincode,
                'address.billing.street': billingStreet,
                'address.billing.city': billingCity,
                ' address.billing.pincode': billingPincode
            }
        }, { new: true })

        return res.status(200).send({ status: true, message:'Success',data: updateUserData});

    } catch (err) {
        res.status(500).send({ message: "Server not responding", error: err.message });
    }
};

// -----------------------------------Exports----------------------------------------------
module.exports = { createUser, loginUser, getUser, updateUser }