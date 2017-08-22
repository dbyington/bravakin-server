const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mediaSchema = new Schema({
  id: String,
  owner: {type: Number, ref: 'User'},
  title: String,
  url: String,
  link: String,
  posted_at: Date,
  tags: Array
});

const Media = mongoose.model('Media', mediaSchema);
module.exports = Media;
