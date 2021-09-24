const jwt = require("jsonwebtoken");
const key = "!@#$%&^%";
function tokenVerifier(req, res, next) {
  let nonsecure = ["/Auth", "UI"];
  console.log(nonsecure.includes(req.path));
  if (nonsecure.includes(req.path)) return next();
  if (req.cookies.token) {
    //console.log(req.body.token);
    var payload;
    try {
      payload = jwt.verify(req.cookies.token, key);
      console.log(payload);
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
  if (req.cookies.token) {
    //console.log(req.body.token);
    var payload;
    try {
      payload = jwt.verify(req.cookies.token, key);
      console.log(payload);
    } catch (e) {
      console.log(e);
      res.status(400).send({ err: "Bad auth" });
      return;
    }
    // console.log(payload);
  } else {
    res.status(401).send({ err: "Unauthorized Request..." });
    return;
  }
  const secsRemain = payload.exp - Math.round(Number(new Date()) / 1000);
  console.log(secsRemain / 60, secsRemain);
  if (secsRemain > 60) {
    return res.status(400).json({ tme: secsRemain });
  }
  const newToken = jwt.sign({ name: payload.name, id: payload.id }, key, {
    expiresIn: "10m"
  });
  res.cookie("token", newToken, { httpOnly: true }).end();
}
module.exports = { getKey, tokenRefresher, tokenVerifier };
