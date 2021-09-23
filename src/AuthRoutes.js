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
      // console.log("info:", info);
      console.log(
        "temp: ",
        utility.dataEncrypt({
          otp: utility.PINEncrypt(otp),
          expireAt: utility.AddMinutesToTime(new Date(), 10)
        })
      );
      // res.send({ h: "hello" });
      shopModel.findOneAndUpdate(
        { shopOwnerEmail: { $eq: id.email } },
        {
          temp: utility.dataEncrypt({
            otp: utility.PINEncrypt(otp),
            expireAt: utility.AddMinutesToTime(new Date(), 10)
          })
        },
        function (err, data) {
          if (err) {
            res.send({ err: "Internal server error", code: 500, act: err });
          }

          res.send({ Msg: "Otp sent successfully..." });

          console.log("data: ", data);
        }
      );
    }
  });
});
router.post("/SubmitOtp", (req, res) => {
  let pack = utility.dataDecrypt(req.body.otp);
  console.log(pack);
  res.send(pack);
});
module.exports = router;
