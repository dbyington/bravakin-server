const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mediaSchema = new Schema({
  id: Number,
  url: String,
  link: String,
  likes: Number,
  comments: Number,
  tags: Array
});
