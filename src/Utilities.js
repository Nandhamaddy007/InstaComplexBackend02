var CryptoJS = require("crypto-js");

function dataEncrypt(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), "!@#$%^&*()").toString();
}
function dataDecrypt(data) {
  let bytes = CryptoJS.AES.decrypt(data, "!@#$%^&*()");
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}
module.exports = { dataEncrypt, dataDecrypt };
