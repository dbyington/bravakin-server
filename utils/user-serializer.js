'use strict';

const userProps = ['id', 'username', 'full_name', 'profile_picture', 'like_tags', 'be_like'];

module.exports.serialize = (user) => {
  const userz = _seralize(user, userProps);
  return userz;
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
