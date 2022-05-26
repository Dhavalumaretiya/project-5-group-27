const mongoose = require("mongoose")

const productSchema = mongoose.Schema({

    title :  {type:String, required:true, unique:true, trim:true},

    description : {type:String, required:true, trim:true},

    price : {type:Number},

    currencyId : {type:String, required:true, default:"INR", trim:true},

    currencyFormat : {type:String, required:true, default:"₹", trim:true},

    isFreeShipping : {type:Boolean, default:false},

    productImage : {type:String, required:true, trim:true},

    style : {type:String, trim:true},

    availableSizes : [{
        type : String,
        required:true,
        enum : ["S","XS","M","X","L","XXL","XL"],
        trim:true
    }],

    installments : {type:Number},

    deletedAt : {type:Date, default: null},

    isDeleted : {type:Boolean, default:false}

}, { timestamp: true });

module.exports = mongoose.model("Product", productSchema);