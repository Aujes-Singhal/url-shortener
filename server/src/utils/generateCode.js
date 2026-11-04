const { randomInt } = require("crypto");

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; // base62

// Random base62 string. crypto.randomInt gives unbiased, unpredictable characters.
function generateCode(length) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}

function isValidCode(code, length) {
  return new RegExp(`^[0-9A-Za-z]{${length}}$`).test(code);
}

module.exports = { generateCode, isValidCode };
