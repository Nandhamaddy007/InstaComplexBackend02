const mongoose = require("mongoose");

var transactionSchema = mongoose.Schema({
  orderId: {
    type: String,
    required: true
  },
  products: {
    type: Array,
    required: true
  },
  custDetails: {
    type: Object,
    required: true
  },
  shopOwnerInstaId: {
    type: String,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  status: String,
  shipmentId: String,
  orderedDate: String
});
module.exports = mongoose.model(
  "transaction",
  transactionSchema,
  "transDetails"
);
