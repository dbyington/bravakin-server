'use strict';

const db = require('../db');
const User = require('../models/user.model');
const UserStats = require('../models/user-stats.model');
const Media = require('../models/media.model');
const MediaStats = require('../models/media-stats.model')

class Collector {
  async getScrape () {
    const scrapeObject = await scrape();
    if (scrapeObject['user']) {
      await this.updateUserStats(scrapeObject);
    } else if (scrapeObject['media']) {
      await this.saveMediaStats(scrapeObject);
    }
  };

  async saveMediaStats (scrapeObject) {
    scrapeObject['media'].forEach(async media => {
      let dbMedia = await Media.findOne({title: media['title']});
      if (dbMedia['_id']) {
        await this._saveMediaStat(dbMedia, media);
      } else {
        // insert new media
        await this._insertNewMedia(dbMedia);
        // insert new media stats
        dbMedia = await Media.findOne({title: media['title']});
        if (dbMedia['_id']) {
          await this._saveMediaStat(dbMedia, media);
        }
      }
    })
  }

  async updateUserStats (scrapeObject) {
    let dbUser = await User.findOne({name: scrapeObject['user'].name});
    if (dbUser['_id']) {
      await this._saveUserStats(dbUser, scrapeObject['user']);
    } else {
      // this should not happen, but just in case...
      await this._insertNewUser(scrapeObject);
      dbUser = await User.findOne({name: scrapeObject['user'].name});
      if (dbUser['_id']) {
        await this._saveUserStats(dbUser, scrapeObject['user']);
      }
    }
  }

  async _saveUserStats (dbUser, scrapeUser) {
    const newFollowersList = scrapeUser['followers']
      .filter(f => !dbUser['followers'][f]);
    const userStats = new UserStats({
      num_followers: scrapeUser['num_followers'],
      followers: newFollowersList,
      timestamp: scrapeUser['scraped_at']
    });
    try {
      await userStats.save();
    } catch (e) {
      console.log('there was a problem saving user stats:', e);
    }
  }

  async _insertNewUser (scrapeUser) {
    const newUser = new User({
      username: scrapeUser['name']
    });
    try {
      await newUser.save();
    } catch (e) {
      console.log('there was an error saving a new user:', e);
    }
  }

  async _insertNewMedia (dbMedia) {
    const newMedia = new Media({
      name: dbMedia['name'],
      url: dbMedia['url'],
      posted_at: dbMedia['posted_at'],
      tags: dbMedia['tags']
    })
    try {
      await newMedia.save();
    } catch (e) {
      console.log('error creating new media:', e);
    }
  }

  async _saveMediaStat (dbMedia, newStats) {
    const mediaStat = new MediaStats({
      id: dbMedia['_id'],
      likes: newStats['likes'],
      comments: newStats['comments'],
      timestamp: newStats['scraped_at']
    });
    try {
      await mediaStat.save();
    } catch (e) {
      console.log('error saving media stats:', e);
    }
  }
}

module.exports = Collector;
