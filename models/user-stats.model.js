const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userStatsSchema = new Schema({
  id: Number,
  num_followers: Number,
  collected_at: Date
});

const UserStats = mongoose.model('UserStats', userStatsSchema);
module.exports = UserStats;
