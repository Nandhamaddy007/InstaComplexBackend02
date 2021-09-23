const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

const utility = require("./Utilities");
var shopModel = require("./shopSchema");
router.get("/GetOtp/:Email", (req, res) => {
  let id = utility.dataDecrypt(req.params.Email);
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
    to: id,
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
      console.log("info:", info);
      shopModel.findOneAndUpdate(
        { shopOwnerEmail: id },
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
          if (data) {
            res.send({ Msg: "Otp sent successfully..." });
          }
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
