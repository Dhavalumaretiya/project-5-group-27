const mongoose = require("mongoose")

const productSchema = mongoose.Schema({

    title: { type: String, required: true, unique: true },

    description: { type: String, required: true },

    price: { type: Number, required: true }, //valid number/decimal

    currencyId: { type: String, required: true, default:"INR" },

    currencyFormat: { type: String, required: true, default: "₹" }, //Rupee symbol

    isFreeShipping: { type: Boolean, default: false },

    productImage: { type: String, required: true },  // s3 links

    style: { type: String },

    availableSizes: { type: [String], enum: ["S", "XS", "M", "X", "L", "XXL", "XL"] ,trim:true}, //array of string, at least one size

    installments: { type: Number },

    deletedAt: { type: Date, default: null },  //when the document is deleted

    isDeleted: { type: Boolean, default: false },

}, { timestamp: true });

module.exports = mongoose.model("Product", productSchema);