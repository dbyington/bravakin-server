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
  favorite: {type: String, select: false},
  cake: String
});

function updateFavorite (next) {
  let user = this;
  if (!user.cake) return next();
  user.favorite = crypt.encrypt(user.cake);
  user.cake = undefined;
  next();
}

function getFavorite (next) {
  let user = this;
  if (user._id && user.favorite && !user.username) {
    user.favorite = crypt.decrypt(user.favorite);
  }
}

userSchema.pre('save', updateFavorite);
userSchema.pre('update', updateFavorite);
userSchema.post('init', getFavorite);

const User = mongoose.model('User', userSchema);
module.exports = User;
