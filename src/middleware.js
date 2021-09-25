const jwt = require("jsonwebtoken");

const utility = require("./Utilities");

const key = "!@#$%&^%";
function tokenVerifier(req, res, next) {
  if (req.headers.authorization) {
    var payload;
    try {
      payload = jwt.verify(utility.dataDecrypt(req.headers.authorization), key);
      // console.log(payload);
    } catch (e) {
      console.log(e);
      res.status(400).send({ err: "Bad auth", expired: e.expiredAt });
      return;
    }
    // console.log(payload);
  } else {
    res.status(401).send({ err: "Unauthorized Request..." });
    return;
  }
  next();
}
function getKey() {
  return key;
}
function tokenRefresher(req, res) {
  if (req.headers.authorization) {
    try {
      var payload = jwt.verify(
        utility.dataDecrypt(req.headers.authorization),
        key
      );
      // console.log(payload);
    } catch (e) {
      console.log(e);
      res.status(400).send({ err: "Bad auth", expired: e.expiredAt });
      return;
    }
    var newToken = getToken({
      role: "Admin",
      email: payload.email
    });

    res.send({ token: utility.dataEncrypt(newToken) });
  }
}

function getToken(userdata) {
  return jwt.sign(userdata, key, {
    expiresIn: "15m",
    subject: "AdminId"
  });
}
module.exports = { getToken, getKey, tokenRefresher, tokenVerifier };
