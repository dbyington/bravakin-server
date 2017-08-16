'use strict';

const request = require('request-promise');

const api = require('../.api-credentials');
const db = require('../db');
const User = require('../models/user.model');
const UserStats = require('../models/user-stats.model');
const Media = require('../models/media.model');
const MediaStats = require('../models/user.model');

const apiSelfUrl = api.url + '/user'; // for username, num_followers
const apiFollowersUrl = api.url + '/self/followed-by'; // for follower names
const apiSelfMediaUrl = api.url + '/user/self/media/recent' // for media details
// follower's recent media /users/{user-id}/media/recent

class ApiClient {
  // given our user object update the num_followers and followers
  async updateUserStats (dbUser) {
    let data;
    const accessTokenParam = '?access_token=' + dbUser['access_token'];
    try {
      data = await request.get(apiSelfUrl + accessTokenParam);
    } catch (e) {
      console.log('error retriving api self');
    }
    if (data['user']) {
      const user = data['user'];
      if (dbUser) {
        // update num_followers in UserStats
        const statsUpdate = new UserStats({
          id: dbUser['_id'],
          num_followers: user['counts'].followed_by,
          collected_at: Date.now()
        });
        try {
          await statsUpdate.save();
        } catch (e) {
          console.log('problem saving num_followers stat:', e);
          throw (e);
        }
        // get and update followers in User
        const apiFollowers = await this._getFollowers(dbUser);

        const followersUpdate = apiFollowers.filter(f => !dbUser['followers'].f)
        try {
          await User.update(
            {'_id': dbUser['_id']},
            {$set: { followers: followersUpdate }}
          );
        } catch (e) {
          console.log('problem updating user follower');
        }
      }
    }
  }

  async _getFollowers (dbUser) {
    const accessTokenParam = '?access_token=' + dbUser['access_token'];
    const url = apiFollowersUrl + accessTokenParam;
    const followers = await this._getArrayFrom(url);
    return followers;
  }

  async saveMediaStats (dbUser) {
    const newApiMedia = await this._getMedia(dbUser);
    await this._saveMediaStat(newApiMedia);
  }

  async _getMedia (dbUser) {
    const accessTokenParam = '?access_token=' + dbUser['access_token'];
    const url = apiSelfMediaUrl + accessTokenParam;
    const media = await this._getArrayFrom(url);
    return media;
  }

  async _getArrayFrom (url) {
    let arr = [];
    try {
      do {
        const response = await request.get(url);
        arr = arr.concat(response['data']);
        url = response['pagination'] ? response['pagination'].next_url : undefined;
      } while (url);
    } catch (e) {
      console.log('problem getting:', e);
      throw (e);
    }
    return arr;
  }

  async _saveMediaStat (newApiMedia) {
    newApiMedia['data'].forEach(async m => {
      let dbMedia;
      try {
        dbMedia = await Media.findOne({name: m['id']});
      } catch (e) {
        console.log('error getting media id:', e);
      }
      // if no myId, insert new media and save stats on that id
      if (!dbMedia['id']) {
        const newMedia = new Media({
          id: m['id'],
          title: m['title'],
          url: m['url'],
          link: m['link'],
          posted_at: m['caption'].created_time,
          tags: m['tags']
        });
        try {
          await newMedia.save();
        } catch (e) {
          console.log('there was a problem inserting new media:', e);
        }
      }
      const newMediaStats = new MediaStats({
        id: m['id'],
        likes: m['likes'].count,
        comments: m['comments'].count,
        timestamp: Date.now()
      });
      try {
        await newMediaStats.save();
      } catch (e) {
        console.log('problem saving new media stats:', e);
      }
    });
  }
}

module.exports = ApiClient;
