const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
const validator = require("../utils/validation");


// ----------------------------------------Create order---------------------------------------------------------------

const createOrder = async function (req, res) {
    try {
        const requestBody = req.body;
        let userId = req.params.userId;
        // Extract Params
        var { productId,cartId,cancellable,status } = requestBody;

        // validation starts
        if (!validator.validRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Body Data is required' })
        };

        if (!validator.vaildObjectId(userId)) {
            return res.status(400).send({ status: false, message: 'UserId id is invalid' })
        };

        if (!validator.vaildObjectId(productId)) {
            return res.status(400).send({ status: false, message: 'Product id Id is invalid' })
        };

        if(!cartId){
            return res.status(400).send({ status: false, message: 'Cart dose not exists' })
        };

        if (!validator.vaildObjectId(cartId)) {
            return res.status(400).send({ status: false, message: 'CartId id is invalid' })
        };
        // searching cart to match the cart by userId whose is to be ordered
        const findCartDetails = await cartModel.findOne({_id:cartId,userId:userId});

        if(!findCartDetails){
            return res.status(400).send({ status: false, message: `Cart dose not belongs to ${userId}` })
        };

        if(cancellable){
            if(typeof cancellable !="boolean"){
                return res.status(400).send({ status: false, message: 'Cancellable must be either true or false' })
            }
        };

        if(status){
            if(!validator.isValidStatus(status)){
                return res.status(400).send({ status: false, message: 'Status must be among ["pending", "completed", "cancled"]' })
            }
        };
        




    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

module.exports = {createOrder}