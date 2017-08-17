const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mediaSchema = new Schema({
  id: String,
  title: String,
  url: String,
  link: String,
  posted_at: Number,
  tags: Array
});

const Media = mongoose.model('Media', mediaSchema);
module.exports = Media;
