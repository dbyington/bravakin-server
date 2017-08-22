'use strict';
require('dotenv').config();

const request = require('request-promise');

const UserStats = require('../models/user-stats.model');
const Media = require('../models/media.model');
const MediaStats = require('../models/media-stats.model');

const apiUrl = 'https://api.instagram.com/v1';
const apiSelfUrl = apiUrl + '/users/self'; // for username, num_followers
const apiFollowersUrl = apiSelfUrl + '/followed-by'; // for follower names
const apiSelfMediaUrl = apiSelfUrl + '/media/recent' // for media details
// follower's recent media /users/{user-id}/media/recent

class ApiClient {
  async updateUserStats (dbUser) {
    let data;
    const accessTokenParam = '?access_token=' + dbUser['access_token'];
    const uri = apiSelfUrl + accessTokenParam;
    try {
      data = await request(uri);
    } catch (e) {
      console.log('error retriving api self');
    }
    const response = JSON.parse(data);
    if (response['data']) {
      const user = response['data'];
      if (dbUser) {
        const statsUpdate = new UserStats({
          id: dbUser['id'],
          num_followers: user['counts'].followed_by,
          collected_at: new Date()
        });
        try {
          await statsUpdate.save();
        } catch (e) {
          console.log('problem saving num_followers stat:', e);
          throw (e);
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
    await this._saveMediaStat(newApiMedia, dbUser);
  }

  async _getMedia (dbUser) {
    const accessTokenParam = '?access_token=' + dbUser['access_token'];
    const url = apiSelfMediaUrl + accessTokenParam;
    const media = await this._getArrayFrom(url);
    return media;
  }

  async _getArrayFrom (url) {
    let arr = [];
    let response = {};
    response['data'] = ['this', 'is', 'a', 'test'];
    try {
      do {
        const response = JSON.parse(await request.get(url));
        arr = arr.concat(response['data']);
        url = response['pagination'] ? response['pagination'].next_url : undefined;
      } while (url);
    } catch (e) {
      console.log('problem getting:', e);
      throw (e);
    }
    return arr;
  }

  async _saveMediaStat (newApiMedia, dbUser) {
    for (let i = 0; i < newApiMedia.length; i++) {
      const m = newApiMedia[i];
      let dbMedia;
      try {
        dbMedia = await Media.findOne({id: m['id']});
        Media.update({id: m['id']}, {$set: {owner: dbUser['id']}});
      } catch (e) {
        console.log('error getting media id:', e);
      }
      if (!dbMedia) {
        const newMedia = new Media({
          id: m['id'],
          owner: dbUser['id'],
          title: m['title'],
          owner: m['user'].id,
          url: m['url'],
          link: m['link'],
          posted_at: new Date(m['caption'].created_time * 1000),
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
        owner: dbUser['id'],
        likes: m['likes'].count,
        comments: m['comments'].count,
        collected_at: new Date()
      });
      try {
        await newMediaStats.save();
      } catch (e) {
        console.log('problem saving new media stats:', e);
      }
    }
  }
}

module.exports = ApiClient;
