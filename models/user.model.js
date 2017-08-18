const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  id: Number,
  username: String,
  full_name: String,
  profile_picture: String,
  be_like: Array,
  like_tags: Array,
  followers: Array,
  access_token: String
});

const User = mongoose.model('User', userSchema);
module.exports = User;
