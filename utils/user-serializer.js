'use strict';

const userProps = ['id', 'username', 'full_name', 'profile_picture', 'like_tags', 'be_like'];

module.exports.serialize = (user) => {
  return  _seralize(user, userProps);
}

module.exports.serializeWithToken = (user) => {
  return _seralize(user, [...userProps, 'access_token']);
}

function _seralize (user, userProps) {
  return userProps.reduce((acc, el) => {
    acc[el] = user[el];
    return acc;
  }, {});
}

// module.exports = [serialize, serializeWithToken];
