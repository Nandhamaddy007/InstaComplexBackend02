//var http = require("http");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var CryptoJS = require("crypto-js");
var multer = require("multer");
var fs = require("fs");
var shopModel = require("./shopSchema");
var transactions = require("./TransactionSchema");
let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(function (req, res, next) {
  //res.header("Access-Control-Allow-Origin",heroku);
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
var loc =
  "mongodb+srv://nandhagopal:NandhaAdmin01!@mydb.4lyfk.gcp.mongodb.net/InstaComplexTest?retryWrites=true&w=majority";
mongoose.connect(
  loc,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true },
  function (error) {
    if (error) {
      console.log("Error! " + error);
    }
  }
);
app.post("/updateShop/:shopOwnerInstaId", (req, res) => {
  //console.log(req.params.shopName);
  let name = req.params.shopOwnerInstaId;
  let shopData = dataDecrypt(req.body.body);
  console.log(shopData);
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

app.post("/CreateShop", (req, res) => {
  //console.log(req.body);
  let shopData = dataDecrypt(req.body.body);
  //console.log(shopData);
  var newShop = new shopModel(shopData);
  newShop.save(function (err, data) {
    if (err) {
      res.send({ err: "Internal server error", code: 500, act: err });
    }
    res.send({
      body: "Shop Added Successfully!!!",
      shopOwnerInstaId: shopData.shopOwnerInstaId
    });
  });
});
app.get("/", (req, res) => {
  res.send("Experss reply");
});
app.get("/GetShop/:shopOwnerInstaId", (req, res) => {
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
    let cipherText = dataEncrypt(data);
    res.send({ body: cipherText });
  });
});
app.get("/getShops", (req, res) => {
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
      let cipherText = dataEncrypt(data);
      res.send({ body: cipherText });
    }
  );
});
app.post("/AddOrder", (req, res) => {
  let data = dataDecrypt(req.body.body);
  //console.log(data);
  let newTrans = transactions({
    orderId: data.orderId,
    products: data.products,
    custDetails: data.custDetails,
    shopOwnerInstaId: data.shopOwnerInstaId,
    total: data.total,
    status: data.status
  });
  newTrans.save(function (err, data) {
    if (err) {
      res.send({ err: "Internal server error", code: 500, act: err });
    }
    //console.log(data);
    res.send({
      msg:
        "Hi " +
        data.custDetails.shopperName +
        ", your Order is Placed Successfully!!!"
    });
  });
});

app.get("/getOrderCount", (req, res) => {
  transactions.countDocuments({}, function (err, count) {
    if (err) {
      res.send({ err: "Internal server error", code: 500, act: err });
    } else {
      res.send({ cnt: count });
    }
  });
});

app.get("/getOrders/:shopOwnerInstaId", (req, res) => {
  let id = req.params.shopOwnerInstaId;
  transactions.find({ shopOwnerInstaId: { $eq: id } }, { _id: 0 }, function (
    err,
    data
  ) {
    if (err) {
      res.send({ err: "Internal server error", code: 500, act: err });
    }
    let cipherText = dataEncrypt(data);

    res.send({ body: cipherText });
  });
});

app.patch("/updateOrder", (req, res) => {
  let data = dataDecrypt(req.body.body);
  //console.log(data);
  let temp = { status: data.status };
  if (data.status === "Shipped") {
    temp["shipmentId"] = data.shipmentId;
  }
  transactions.findOneAndUpdate(
    { orderId: { $eq: data.orderId } },
    temp,
    function (err, data) {
      if (err) {
        res.send({ err: "Internal server error", code: 500, act: err });
      }
      res.send({ msg: "Order updated successfully!!!" });
    }
  );
});

function dataEncrypt(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), "!@#$%^&*()").toString();
}
function dataDecrypt(data) {
  let bytes = CryptoJS.AES.decrypt(data, "!@#$%^&*()");
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

//create a server object:
app.listen(8080, () => console.log("Server started"));
// http
//   .createServer(function (req, res) {
//     res.write("Hello World!"); //write a response to the client
//     res.end(); //end the response
//   })
//   .listen(8080); //the server object listens on port 8080
