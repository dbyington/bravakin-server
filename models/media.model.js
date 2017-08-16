const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mediaSchema = new Schema({
  title: String,
  url: String,
  link: String,
  posted_at: Date,
  tags: Array
});
