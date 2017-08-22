'use strict';

const userProps = ['id', 'username', 'full_name', 'profile_picture', 'like_tags', 'be_like'];

module.exports.serialize = (user) => {
  return _serialize(user, userProps);
}

module.exports.serializeWithToken = (user) => {
  return _serialize(user, [...userProps, 'access_token']);
}

function _serialize (user, userProps) {
  return userProps.reduce((acc, el) => {
    acc[el] = user[el];
    return acc;
  }, {});
}

// module.exports = [serialize, serializeWithToken];
