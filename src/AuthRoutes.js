const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");

var tkV = require("./middleware");
const utility = require("./Utilities");
var shopModel = require("./shopSchema");
router.post("/GetOtp", (req, res) => {
  let id = utility.dataDecrypt(req.body.body);
  shopModel.findOne(
    { shopOwnerEmail: { $eq: id.email } },
    { _id: 0, temp: 1 },
    function (err, data) {
      if (err) {
        res.send({ err: "Internal server error", code: 500, act: err });
      } //check already logged in
      if (data.temp === "IN") {
        res.status(406).send({
          Msg: "User has already logged in, kindly logout and try again"
        });
      } else {
        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "Nandhamaddy007@gmail.com",
            pass: "aejtxqufukpxihba"
          }
        });
        const otp = otpGenerator.generate(4, {
          digits: true,
          alphabets: true,
          upperCase: true,
          specialChars: false
        });
        console.log("OTP: ", otp);
        var Mail = {
          from: "Nandhamaddy007@gmail.com",
          to: id.email,
          subject: "Mail from Instacomplex",
          html: `<h1>Instacomplex OTP for Login</h1></br>
        <h4>Your otp is: <b>${otp}</b> </h4></br>
        <h4>Will expire in 10 Minutes</h4>`
        };
        transporter.sendMail(Mail, (err, info) => {
          if (err) {
            console.log(err);
            res.send({ err: "Internal server error", code: 500, act: err });
          } else {
            shopModel.findOneAndUpdate(
              { shopOwnerEmail: { $eq: id.email } },
              {
                temp: utility.dataEncrypt({
                  otp: utility.PINEncrypt(otp),
                  expireAt: utility.AddMinutesToDate(new Date(), 10)
                })
              },
              function (err, data) {
                if (err) {
                  res.send({
                    err: "Internal server error",
                    code: 500,
                    act: err
                  });
                }
                res.send({ Msg: "Otp sent successfully..." });
              }
            );
          }
        });
      }
    }
  );
});
router.put("/Logout", (req, res) => {
  let body = utility.dataDecrypt(req.body.body);
  shopModel.findOneAndUpdate(
    { shopOwnerEmail: { $eq: body.email } },
    { temp: "OUT" },
    function (err, data) {
      if (err) {
        res.send({ err: "Internal server error", code: 500, act: err });
      }
      res.send({ Msg: "Logged out..." });
    }
  );
});
router.patch("/setLogout", (req, res) => {
  let body = utility.dataDecrypt(req.body.body);

  if (body.code === "9841") {
    console.log(body);
    shopModel.findOneAndUpdate(
      { shopOwnerEmail: { $eq: body.email } },
      { temp: "OUT" },
      function (err, data) {
        if (err) {
          res.send({ err: "Internal server error", code: 500, act: err });
        }
        res.send({ Msg: "Force Logged out..." });
      }
    );
  }
});

router.post("/SubmitOtp", (req, res) => {
  let pack = utility.dataDecrypt(req.body.otp);
  shopModel.findOne(
    { shopOwnerEmail: { $eq: pack.email } },
    { _id: 0, PIN: 1, temp: 1 },
    function (err, data) {
      if (err) {
        res.send({ err: "Internal server error", code: 500, act: err });
      }
      console.log(data);
      let check = utility.dataDecrypt(data.temp);
      if (check.expireAt > new Date().getTime()) {
        if (
          utility.PINDecrypt(check.otp) + utility.PINDecrypt(data.PIN) ===
          pack.pinotp
        ) {
          shopModel.findOneAndUpdate(
            { shopOwnerEmail: { $eq: pack.email } },
            {
              temp: "IN"
            },
            function (err, data) {
              //send token
              var userdata = {
                role: "Admin",
                email: pack.email
              };
              let token = tkV.getToken(userdata);
              console.log(token);
              let time = utility.AddMinutesToDate(new Date(), 14);
              res.send({ tkn: utility.dataEncrypt(token), expiresIn: time });
            }
          );
        } else {
          res.status(401).send({
            Msg: "Please check your PIN,OTP or Email id and try again..."
          });
        }
      } else {
        res.status(410).send({ Msg: "OTP Expired please try again..." });
      }
    }
  );
});
module.exports = router;
