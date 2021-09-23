var CryptoJS = require("crypto-js");

function dataEncrypt(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), "!@#$%^&*()").toString();
}
function dataDecrypt(data) {
  let bytes = CryptoJS.AES.decrypt(data, "!@#$%^&*()");
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}
function PINEncrypt(data) {
  return CryptoJS.AES.encrypt(data, "!@#$%^&*()0192837465").toString();
}
function PINDecrypt(data) {
  return CryptoJS.AES.decrypt(data, "!@#$%^&*()0192837465").toString(
    CryptoJS.enc.Utf8
  );
}
function AddMinutesToDate(date, minutes) {
  return date.getTime() + minutes * 60000;
}

module.exports = {
  dataEncrypt,
  dataDecrypt,
  PINEncrypt,
  PINDecrypt,
  AddMinutesToDate
};
