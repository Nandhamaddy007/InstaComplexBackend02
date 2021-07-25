const express = require("express");
const router = express.Router();

const shopModel = require("./shopSchema");
const utility = require("./Utilities");

router.get("/GetShop/:shopOwnerInstaId", (req, res) => {
  let id = req.params.shopOwnerInstaId;
  //console.log(id);
  shopModel.findOne({ shopOwnerInstaId: { $eq: id } }, { _id: 0 }, function (
    err,
    data
  ) {
    if (err) {
      res.send({ err: "Internal server error", code: 500, act: err });
    }
    //console.log(data);
    let cipherText = utility.dataEncrypt(data);
    res.send({ body: cipherText });
  });
});
router.get("/getShops", (req, res) => {
  shopModel.find(
    {},
    {
      _id: 0,
      shopName: 1,
      shopOwner: 1,
      shopOwnerMobile: 1,
      shopOwnerAddress: 1,
      shopOwnerInstaId: 1,
      shopLogo: 1
    },
    function (err, data) {
      if (err) {
        res.send({ err: "Internal server error", code: 500, act: err });
      }
      let cipherText = utility.dataEncrypt(data);
      res.send({ body: cipherText });
    }
  );
});
module.exports = router;
