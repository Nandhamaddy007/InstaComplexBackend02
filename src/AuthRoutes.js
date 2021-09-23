const express = require("express");
const router = express.Router();
const utility = require("./Utilities");
router.get("/GetOtp/Email", (req, res) => {
  let id = utility.dataDecrypt(req.params.Email);
});
module.exports = router;
