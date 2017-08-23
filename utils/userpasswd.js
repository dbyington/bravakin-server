'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const User = require('../models/user.model');

const setPasswd = async () => {
  if (process.argv.length === 4) {
    const username = process.argv[2];
    const passwd = process.argv[3];
    console.log('username:', username);
    console.log('passwd:', passwd);
    try {
      const user = await User.findOne({username: username});
      console.log('user:', user);
      user.cake = passwd;
      await user.save();
    } catch (e) {
      console.log('error getting user:', e);
    }
    db.close();
  } else {
    const username = process.argv[2];
    try {
      let user = await User.findOne({username: username});
      console.log('user:', user);
      user = await User.findOne({username: username}, {favorite: 1});
      console.log('user with favorite:', user);
    } catch (e) {
      console.log('error:', e);
    }
    db.close();
  }
}

mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', setPasswd);
