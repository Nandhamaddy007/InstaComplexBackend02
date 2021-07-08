const mongoose = require("mongoose");
var productSchema = new mongoose.Schema({
  productName: String,
  productColor: String,
  productId: String,
  productSrc: String,
  productAvailability: Boolean,
  ProductVariance: Array
});

module.exports = mongoose.model("product", productSchema, "productDetails");
