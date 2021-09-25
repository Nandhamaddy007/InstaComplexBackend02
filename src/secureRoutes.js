const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const shopModel = require("./shopSchema");
const utility = require("./Utilities");
var transactions = require("./TransactionSchema");

router.post("/updateShop/:shopOwnerInstaId", (req, res) => {
  //console.log(req.params.shopName);
  let name = req.params.shopOwnerInstaId;
  let shopData = utility.dataDecrypt(req.body.body);
  //console.log(shopData);
  shopModel.findOneAndUpdate(
    { shopOwnerInstaId: { $eq: name } },
    shopData,
    function (err, data) {
      if (err) {
        res.send({ err: "Internal server error", code: 500, act: err });
      }
      console.log(data);
      res.send({ body: "Shop Updated Successfully!!!" });
    }
  );
});
router.get("/getOrders/:shopOwnerInstaId", (req, res) => {
  let id = req.params.shopOwnerInstaId;
  transactions.find({ shopOwnerInstaId: { $eq: id } }, { _id: 0 }, function (
    err,
    data
  ) {
    if (err) {
      res.send({ err: "Internal server error", code: 500, act: err });
    }
    let cipherText = utility.dataEncrypt(data);

    res.send({ body: cipherText });
  });
});

router.patch("/updateOrder", (req, res) => {
  let data = utility.dataDecrypt(req.body.body);
  // console.log(data);
  let temp = { status: data.status };
  if (data.status === "Shipped") {
    temp["shipmentId"] = data.shipmentId;
  }
  transactions.findOneAndUpdate(
    {
      orderId: { $eq: data.orderId },
      shopOwnerInstaId: { $eq: data.shopOwnerInstaId }
    },
    temp,
    function (err, data) {
      if (err) {
        res.send({ err: "Internal server error", code: 500, act: err });
      }
      res.send({ msg: "Order updated successfully!!!" });
    }
  );
});

router.get("/check", (req, res) => {
  let t = utility.dataDecrypt(req.headers.authorization);
  t = jwt.verify(t, "!@#$%&^%");
  console.log(t);
  res.send({ Msg: t });
});

module.exports = router;
