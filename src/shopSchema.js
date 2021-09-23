const mongoose = require("mongoose");
const ProdDetails = require("./productSchema");
var shopSchema = new mongoose.Schema({
  shopName: String,
  shopOwner: String,
  shopOwnerMobile: Number,
  shopOwnerEmail: String,
  shopOwnerAddress: String,
  shopOwnerInstaId: String,
  shopOwnerGpay: String,
  shopLogo: String,
  shopCreatedAt: String,
  PIN: String,
  temp: String,
  ProductDetails: [
    {
      productName: String,
      productColor: String,
      productId: String,
      productSrc: String,
      productAvailability: Boolean,
      ProductVariance: Array
    }
  ]
});

module.exports = mongoose.model("shop", shopSchema, "shopdetails");
