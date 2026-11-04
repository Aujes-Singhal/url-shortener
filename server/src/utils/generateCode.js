const { randomInt } = require("crypto");

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; 

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
