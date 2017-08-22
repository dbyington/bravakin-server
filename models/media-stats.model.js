'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mediaStatsSchema = new Schema({
  owner: Number,
  id: {type: String, ref: 'Media'},
  likes: Number,
  comments: Number,
  collected_at: Date
});

const MediaStats = mongoose.model('MediaStats', mediaStatsSchema);
module.exports = MediaStats;
