'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mediaStatsSchema = new Schema({
  id: Number,
  likes: Number,
  comments: Number,
  timestamp: Date
});

const MediaStats = mongoose.model('MediaStats', mediaStatsSchema);
module.exports = MediaStats;
