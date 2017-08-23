'use strict';

const User = require('../models/user.model');
const InstagramScraper = require('../utils/ig-scraper');
const usersController = require('./users.controller');

module.exports.getMediaByTag = async (ctx, next) => {
  const accessToken = ctx.header.authorization.split(' ')[1];
  const user = await User.findOne({access_token: accessToken});
  const hashtag = ctx['params'].tag_name;
  if (!hashtag) ctx.throw(400, 'tag_name is required');
  const igScraper = new InstagramScraper(user.username, await usersController.getRawPassword(user));
  const media = await igScraper.getLikeableMediaFromHashtag(hashtag);
  ctx.status = 200;
  ctx.body = { data: media };
}

module.exports.likeMedia = async (ctx, next) => {
  const accessToken = ctx.header.authorization.split(' ')[1];
  const user = await User.findOne({access_token: accessToken});
  const mediaUrl = ctx.request.body.url;
  if (!mediaUrl) ctx.throw(400, 'url is required');
  const igScraper = new InstagramScraper(user.username, await usersController.getRawPassword(user));
  const liked = await igScraper.likeMedia(mediaUrl);
  ctx.body = liked;
}
