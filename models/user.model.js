const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
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
  favorite: String
});

userSchema.pre('save', crypt.updateFavorite);
userSchema.pre('update', crypt.updateFavorite);

const User = mongoose.model('User', userSchema);
module.exports = User;
