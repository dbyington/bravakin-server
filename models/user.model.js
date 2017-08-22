const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypt = require('../utils/crypto');

const userSchema = new Schema({
  id: Number,
  username: String,
  full_name: String,
  profile_picture: String,
  be_like: Array,
  like_tags: Array,
  followers: Array,
  access_token: String,
  favorite: String,
  cake: String
});

function updateFavorite (next) {
  var user = this;
  if (!user.cake) return next();
  user.favorite = crypt.encrypt(user.cake);
  user.cake = undefined;
  next();
}

userSchema.pre('save', updateFavorite);
userSchema.pre('update', updateFavorite);

const User = mongoose.model('User', userSchema);
module.exports = User;
