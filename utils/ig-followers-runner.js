'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const User = require('../models/user.model');
const InstagramScraper = require('./ig-scraper');
const usersController = require('../controllers/users.controller');

const collectStats = async () => {
  let users;
  console.log('Getting users');
  try {
    users = await User.find({
      'access_token': {
        $exists: true,
        $ne: ''
      }
    });
  } catch (e) {
    console.log('problem getting users:', e);
  }
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    if (user['id'] > 1000) {
      console.log(`update stats for ${user['full_name']} (${user['id']})`);
      const passwd = await usersController.getRawPassword(user);
      if (passwd) {
        console.log(user.username, passwd);
        const igScraper = new InstagramScraper(user.username, passwd);
        const result = await igScraper.scrapeFollowers();
        console.log('scrape result\n', result);
        const followers = result.user.followers;
        if (followers && followers.length > 0) {
          user.followers = followers;
          await user.save();
        }
      } else {
        console.log('No password available, not updating.');
      }
    }
  }
  await db.close();
  process.exit();
}

mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', collectStats);
