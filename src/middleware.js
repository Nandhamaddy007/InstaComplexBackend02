const jwt = require("jsonwebtoken");
const expressJWT = require("express-jwt");
const key = "!@#$%&^%";
function tokenVerifier(req, res, next) {
  console.log("came to middleware");
  console.log("cookie:", req.cookies.token);
  if (req.body.token) {
    //console.log(req.body.token);
    var payload;
    try {
      payload = jwt.verify(req.body.token, key);
    } catch (e) {
      console.log(e);
    }
    // console.log(payload);
  }
  next();
}
function getKey() {
  return key;
}
module.exports = { tokenVerifier, getKey };
