const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

const utility = require("./Utilities");
var shopModel = require("./shopSchema");
router.post("/GetOtp", (req, res) => {
  let id = utility.dataDecrypt(req.body.body);
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
            res.send({ err: "Internal server error", code: 500, act: err });
          }
          res.send({ Msg: "Otp sent successfully..." });
        }
      );
    }
  });
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
      let check = utility.dataDecrypt(data.temp);
      if (check.expireAt < new Date().getTime()) {
        if (
          utility.PINDecrypt(check.otp) + utility.PINDecrypt(data.PIN) ===
          pack.pinotp
        ) {
          shopModel.findOneAndUpdate(
            { shopOwnerEmail: { $eq: pack.email } },
            {
              temp: "IN"
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
