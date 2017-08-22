const crypto = require('crypto');
require('dotenv').config();

module.exports.encrypt = (text) => {
  var cipher = crypto.createCipher('aes-256-ctr', process.env.SECRET)
  var crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted;
}

module.exports.decrypt = (text) => {
  var decipher = crypto.createDecipher('aes-256-ctr', process.env.SECRET);
  var dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}
