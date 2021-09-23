const express = require("express");
const router = express.Router();
const utility = require("./Utilities");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
router.get("/GetOtp/:Email", (req, res) => {
  let id = utility.dataDecrypt(req.params.Email);
  // var transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: "Nandhamaddy007@gmail.com",
  //     pass: "Television007#"
  //   }
  // });
  const otp = otpGenerator.generate(4, {
    digits: true,
    alphabets: true,
    upperCase: true,
    specialChars: false
  });
  console.log("OTP: ", otp);
  var Mail = {
    from: "Nandhamaddy007@gmail.com",
    to:
      "karthikvk185@gmail.com,arunreigns169@gmail.com,Nandhamaddy007@gmail.com",
    subject: "Mail from nodejs",
    html: `<h1>Instacomplex OTP for Login</h1></br>
    <h4>Your otp is here: <b>${otp}</b> </h4></br>
    <h4>Will expire in 10 Minutes</h4>`
  };
  // transporter.sendMail(Mail, (err, info) => {
  //   if (err) {
  //     console.log(err);
  //     res.send({ err: "Internal server error", code: 500, act: err });
  //   } else {
  //     console.log("info:", info);
  //     res.send({ Msg: "Otp sent successfully..." });
  //   }
  // });
});
module.exports = router;
