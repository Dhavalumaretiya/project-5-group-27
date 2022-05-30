const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const awsConfig = require("../utils/aws");
const validator = require("../utils/validation");

//--------------------------------------------------Create cart----------------------------------------------------------

const createCart = async function (req, res) {
    try {
        const requestBody = req.body;
        let userId = req.params.userId;
        let userIdfromToken = req.userId;
        var {items} = requestBody;

        // validation starts
        if (!validator.validRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Body Data is required' })
        };

        if (!validator.vaildObjectId(userId)) {
            return res.status(400).send({ status: false, message: 'UserId id is invalid' })
        };
        const {quantity,productId} = items 
        console.log(Object.keys(items))
        if (!validator.vaildObjectId(productId)) {
            return res.status(400).send({ status: false, message: 'Product id Id is invalid' })
        };
     
        console.log(quantity)
        if (!(validator.isValid(quantity)) || !(validator.vailsQuantity(quantity)) ){
            return res.status(400).send({ status: false, message: 'Please provide valid quantity & it must be greater than zero' })
        };
        // validation ends

        // find user
        const findUserData = await userModel.findOne({ _id: userId })
        if (!findUserData) {
            return res.status(400).send({ status: false, message: "User not found." });
        };

        if (findUserData._id.toString() != userIdfromToken) {
            res.status(401).send({ status: false, message: "Unauthorized access!!" });
        };

        // find product
        const findProductData = await productModel.findOne({ _id: productId })
        if (!findProductData) {
            return res.status(400).send({ status: false, message: "Product not found." });
        };

        // find cart related to User
        const findCartData = await createCart.findOne({ userId: userId });

        if (!findCartData) {

            //destructuring for the response body.
            var cartData = {
                userId: userId,
                items: [{
                    productId: productId,
                    quantity: quantity,
                }],
                totalPrice: findProduct.price * quantity,
                totalItems: 1
            }
            const createCart = await cartModel.create(cartData);
            res.status(201).send({ status: true, message: 'Cart created successfully', data: createCart });
        };

        if (findCartData) {

            //updating price when products get added or removed.
            let price = findCartData.totalPrice + (req.body.quantity * findProduct.price)
            let itemsArr = findCartOfUser.items

            //updating quantity.
            for (i in itemsArr) {
                if (itemsArr[i].productId.toString() === productId) {
                    itemsArr[i].quantity += quantity

                    let updatedCart = { items: itemsArr, totalPrice: price, totalItems: itemsArr.length }

                    let responseData = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, updatedCart, { new: true })

                    return res.status(200).send({ status: true, message: `Product added successfully`, data: responseData })
                }
            }
            itemsArr.push({ productId: productId, quantity: quantity }) //storing the updated prices and quantity to the newly created array.

            let updatedCart = { items: itemsArr, totalPrice: price, totalItems: itemsArr.length }
            let responseData = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, updatedCart, { new: true })

            return res.status(200).send({ status: true, message: `Product added successfully`, data: responseData })
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

module.exports = { createCart }