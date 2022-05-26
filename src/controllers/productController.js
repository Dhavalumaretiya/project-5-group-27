const productModel = require("../models/productModel");
const  awsConfig = require("../utils/aws");
const validator = require("../utils/validation");

//-------------------------------------Create product-----------------------------------------------------
const createProduct = async function (req, res) {
    try
    {
        const requestBody = req.body

        //Validation Start
        if(!validator.validRequestBody(requestBody)){
            return res.status(400).send({status:false, message:'Body Data is required'})
        }

        //Extract params
        const {title, description, price, currencyId, currencyFormat, availableSizes, isDeleted, deletedAt} = requestBody

        if(!validator.isValid(title)){
            return res.status(400).send({status:false, message:'Title is required'})
        }
        //Check for unique title
        const isTitleAlreadyExist = await productModel.findOne({title})
        if(isTitleAlreadyExist){
            return res.status(400).send({status:false, message:'This Title is already Exist'})
        }

        if(!validator.isValid(description)){
            return res.status(400).send({status:false, message:'Description is required'})
        }

        if(!validator.isValid(price)){
            return res.status(400).send({status:false, message:'Price is required'})
        }
        // Check for valid number/decimal
        if(!(/^\d{0,8}[.]?\d{1,4}$/.test(price))){
            return res.status(400).send({status:false, message:'Invalid price'})
        }

        if(!validator.isValid(currencyId)){
            return res.status(400).send({status:false, message:'CurrencyId is required'})
        }
        //Check for INR
        if(currencyId !== "INR"){
            return res.status(400).send({status:false, message:'only accepted INR'})
        }

        if(!validator.isValid(currencyFormat)){
            return res.status(400).send({status:false, message:'CurrencyFormat is required'})
        } 
        //check for symbol 
        if(currencyFormat !==  "₹"){
            return res.status(400).send({status:false, message:'Only accepted ₹ this currency symbol'})
        }

        if(!validator.isValid(availableSizes)){
            return res.status(400).send({status:false, message:'AvailableSizes is required'})
        }
        //check for enum ["S", "XS", "M", "X", "L", "XXL", "XL"]
        if(availableSizes){
            let array = availableSizes.split(",").map(x=>x.toUpperCase().trim())
            for(let i=0; i<array.length; i++){
                if(!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(array[i]))){
                    return res.status(400).send({status:false, message:'Sizes only available from ["S", "XS", "M", "X", "L", "XXL", "XL"]'})
                }
            }
            if(Array.isArray(array)){
                requestBody.availableSizes = array
            }
        }
      
        //File-cloud Data for storing image
        let files = req.files

        if (!(files && files.length > 0)){
            return res.status(400).send({ status: false, message: "No file found" });
        }
           
        let uploadedFileURL = await awsConfig.uploadFile(files[0]);

        requestBody.productImage = uploadedFileURL;
        
        const product = await productModel.create(requestBody)
        res.status(201).send({status:true,message:'Product created successfullt', data:product})

    }catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

module.exports = { createProduct }