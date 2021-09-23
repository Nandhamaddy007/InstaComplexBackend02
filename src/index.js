const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { OAuth2Client } = require("google-auth-library");
const https = require("https");

var shopModel = require("./shopSchema");
var transactions = require("./TransactionSchema");
var tkV = require("./middleware");
var UIBased = require("./UIBasedRoutes");
var AuthBased = require("./AuthRoutes");
const utility = require("./Utilities");
const { verify } = require("crypto");
let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["https://angular-ivy-bddfhf.stackblitz.io"],
    credentials: true
  })
);
app.use(function (req, res, next) {
  //res.header("Access-Control-Allow-Origin",heroku);
  res.header(
    "Access-Control-Allow-Origin",
    "https://angular-ivy-bddfhf.stackblitz.io"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("credentials", true);
  next();
});
var loc =
  "mongodb+srv://nandhagopal:NandhaAdmin01!@mydb.4lyfk.gcp.mongodb.net/InstaComplexTest?retryWrites=true&w=majority";
mongoose.connect(
  loc,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  function (error) {
    if (error) {
      console.log("Error! " + error);
    }
    console.log("Connected");
  }
);
// const clientId =
//   "841021988909-76o0jt8lkkdchknitjtvf8r7ea362fft.apps.googleusercontent.com";
// const client = new OAuth2Client(clientId);
// app.get("/check", (req, res) => {
//   let id = req.body.id;
//   console.log(req.body);
//   //verif(id, res);
//   res.send({ hello: req.body });
// });
// function verif(id, res) {
//   client
//     .verifyIdToken({
//       idToken: id,
//       audience: clientId
//     })
//     .then((ticket) => {
//       const payload = ticket.getPayload();
//       const userid = payload["sub"];
//       console.log("userid: ", userid);
//       return payload;
//     })
//     .then((pay) => {
//       res.send({ msg: "auth successfull", pay: pay });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// }
// app.post("/token/signIn", (req, res) => {
//   let googleData = utility.dataDecrypt(req.body.user);
//   //console.log("googl: ", googleData);
//   verif(googleData.Idtoken).catch(console.error);
//   shopModel.findOne(
//     { shopOwnerEmail: { $eq: googleData.email } },
//     { _id: 0, shopOwnerInstaId: 1 },
//     function (err, data) {
//       if (err) {
//         res.send({ err: "Internal server error", code: 500, act: err });
//       }
//       let token;
//       console.log(data);
//       if (data) {
//         var userdata = {
//           emailId: googleData.email,
//           InstaID: data.shopOwnerInstaId
//         };
//         token = jwt.sign(userdata, tkV.getKey(), {
//           expiresIn: "10m",
//           subject: "AdminId"
//         });
//       } else {
//         token = jwt.sign(userdata, tkV.getKey(), {
//           expiresIn: "10m",
//           subject: "UserId"
//         });
//       }
//       res.json({ Id: token, expiresIn: 60 * 10 });
//     }
//   );
// });
app.use("/UI", UIBased);
app.use("/Auth", AuthBased);
app.get("/token/refresh", tkV.tokenRefresher);
app.use("/", tkV.tokenVerifier);
app.post("/updateShop/:shopOwnerInstaId", (req, res) => {
  //console.log(req.params.shopName);
  let name = req.params.shopOwnerInstaId;
  let shopData = utility.dataDecrypt(req.body.body);
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
  let shopData = utility.dataDecrypt(req.body.body);
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
    let cipherText = utility.dataEncrypt(data);
    res.send({ body: cipherText });
  });
});

app.post("/AddOrder", (req, res, next) => {
  let data = utility.dataDecrypt(req.body.body);
  console.log(data);
  let newTrans = transactions({
    orderId: data.orderId,
    products: data.products,
    custDetails: data.custDetails,
    shopOwnerInstaId: data.shopOwnerInstaId,
    total: data.total,
    status: data.status,
    orderedDate: data.orderedDate
  });
  newTrans.save(function (err, data1) {
    if (err) {
      console.log(err);
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

app.get("/getOrderCount/:date", (req, res) => {
  let today = req.params.date;
  transactions.countDocuments({ orderedDate: { $eq: today } }, function (
    err,
    count
  ) {
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
    let cipherText = utility.dataEncrypt(data);

    res.send({ body: cipherText });
  });
});

app.patch("/updateOrder", (req, res) => {
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

//create a server object:
app.listen(8080, () => console.log("Server started"));
// http
//   .createServer(function (req, res) {
//     res.write("Hello World!"); //write a response to the client
//     res.end(); //end the response
//   })
//   .listen(8080); //the server object listens on port 8080
