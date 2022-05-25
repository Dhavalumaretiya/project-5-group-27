const productModel = require("../models/productModel");
const awsConfig = require("../utils/aws");
const validator = require("../utils/validation")

//-------------------------------------Create product-----------------------------------------------------
const createProduct = async function (req, res) {
    try {
        let data = req.body;

        //Validation Start
        if (!validator.validRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Please enter details" })
        };

        //Extract Params
        const { title,description,price } = data;

        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: 'Title is required' })
        };
        if (!validator.isValid(description)) {
            return res.status(400).send({ status: false, message: 'Description required' })
        };
        if (!validator.isValid(price)) {
            return res.status(400).send({ status: false, message: 'Price is required' })
        };
        



    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

module.exports = { createProduct }