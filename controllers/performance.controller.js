'use strict';

const User = require('../models/user.model');
const UserStats = require('../models/user-stats.model');
const Media = require('../models/media.model');
const MediaStats = require('../models/media-stats.model');
const UserSerializer = require('../utils/user-serializer');

const limits = {
  day: {
    msec: 1000 * 3600 * 24,
    ref: 1000 * 3600 * 25,
    label: 'hour'
  },
  week: {
    msec: 1000 * 3600 * 24 * 7,
    ref: 1000 * 3600 * 24 * 8,
    label: 'day'
  },
  month: {
    msec: 1000 * 3600 * 24 * 7 * 4,
    ref: 1000 * 3600 * 24 * 7 * 5,
    label: 'week'
  }
}

module.exports.userStats = async (ctx, next) => {
  let user;
  const timeframe = ctx['query'].timeframe;
  try {
    user = await User.findOne({id: ctx['state'].userId});
  } catch (e) {
    ctx.throw(500, JSON.stringify({error: {status: 500, error_message: e}}));
  }
  const followers = await _getUserFollowerStats(user['id'], timeframe);
  const stats = await _getUserLikeCommentStats(user['id'], timeframe);
  const combinedStats = _combineUserStats(followers, stats);
  const statsObj = { timeframe: timeframe, stat_type: 'user', id: user['id'], stats: combinedStats }
};

module.exports.mediaStats = async (ctx, next) => {
  const timeframe = ctx['query'].timeframe;
  const mediaId = ctx['params'].id;
  const stats = await _getMediaStats(mediaId, timeframe);
  const statsObj = { timeframe: timeframe, stat_type: 'media', id: mediaId, stats: stats }
  ctx.status = 200;
  ctx.body = statsObj;
}

async function _getAggregateStats (model, timeframe, id, raw) {
  const modelType = await model.findOne();
  const getRaw = raw || false;
  const project = {
    day: { $dateToString: {format: '%H', date: '$collected_at'} },
    week: { $isoDayOfWeek: '$collected_at' },
    month: { $isoWeek: '$collected_at' },
    collected_at: 1
  };
  const match = {
    collected_at: {
      $gte: new Date(Date.now() - limits[timeframe].msec)
    }
  };
  const matchRef = {
    collected_at: {
      $gte: new Date(Date.now() - limits[timeframe].ref),
      $lte: new Date(Date.now() - limits[timeframe].msec)
    }
  };
  let group = {
    _id: `$${timeframe}`,
    timeframe: { $first: `${limits[timeframe].label}` },
    date: { $first: '$collected_at' }
  };
  if (modelType && modelType.num_followers !== undefined) {
    project['num_followers'] = 1;
    match['id'] = id;
    matchRef['id'] = id;
    group['followers'] = { $sum: '$num_followers' };
  } else {
    if (typeof id === 'number') {
      match['owner'] = id;
      matchRef['owner'] = id;
    } else {
      match['id'] = id;
      matchRef['id'] = id;
    }
    project['likes'] = 1;
    project['comments'] = 1;
    group['likes'] = { $sum: '$likes' };
    group['comments'] = { $sum: '$comments' };
  }

  let ref = await model.aggregate([
    { '$match': matchRef },
    { '$project': project },
    { '$group': group },
    { '$sort': { _id: 1 } }
  ]);

  const results = await model.aggregate([
    { '$match': match },
    { '$project': project },
    { '$group': group },
    { '$sort': { _id: 1 } }
  ]);

  ref = _checkRef(ref, results);
  if (getRaw) return {reference: ref, results: results};
  const mappedStats = _mapStats(ref, results);
  return mappedStats;
}

const _mapStats = (ref, results) => {
  const keyFilter = ['_id', 'timeframe'];
  let nowIdx;
  const keys = Object.keys(ref[0]).filter(k => !keyFilter.includes(k));
  if (Number(ref[0]._id) < Number(results[0]._id)) {
    nowIdx = results.length - 1;
  } else {
    nowIdx = results.findIndex(el => el._id === ref[0]._id);
  }
  const newResults = results.map((res, idx, arr) => {
    const newObj = {};
    let idxRef;

    if (Number(res['_id']) === Number(ref[0]['_id']) + 1) {
      keys.forEach(k => {
        newObj[k] = typeof res[k] === 'number' ? res[k] - ref[0][k] : res[k];
      });
    } else {
      idxRef = idx - 1 >= 0 ? idx - 1 : arr.length - 1;
      keys.forEach(k => {
        newObj[k] = typeof res[k] === 'number' ? res[k] - arr[idxRef][k] : res[k];
      });
    }
    return newObj;
  });
  return newResults;
}

const _checkRef = (refArr = [], res) => {
  if (refArr.length > 0) return refArr;
  let ref = [...refArr];
  ref = Object.assign({}, res[0]);
  for (let i = 0; i < res.length; i++) {
    if (res[i + 1] && Number(res[i + 1]._id) > Number(res[i]._id) + 1) {
      ref = Object.assign({}, res[i]);
    }
  }
  if (Number(ref['_id']) > 1) {
    ref['_id'] = (Number(ref['_id']) - 1).toString().padStart(2, '0');
  } else if (ref['timeframe'] === 'hour' && Number(ref['_id']) === 1) {
    ref['_id'] = '00';
  } else {
    ref['_id'] = (Number(res[res.length - 1]['_id']) + 1).toString().padStart(2, '0');
  }
  ['likes', 'comments', 'followers'].forEach(prop => {
    if (ref[prop]) ref[prop] = 0;
  });
  return [ref];
}

const _getUserLikeCommentStats = async (userId, timeframe) => {
  const stats = await _getAggregateStats(MediaStats, timeframe, userId);
  return stats;
};

const _getUserFollowerStats = async (userId, timeframe) => {
  const stats = await _getAggregateStats(UserStats, timeframe, userId);
  return stats;
};

const _combineUserStats = (follow, likeComment) => {
  const stats = likeComment.map((lc, idx, arr) => {
    lc['followers'] = follow[idx].followers;
    return lc;
  });
  return stats;
}

const _getMediaStats = async (mediaId, timeframe) => {
  const stats = await _getAggregateStats(MediaStats, timeframe, mediaId);
  return stats;
};
