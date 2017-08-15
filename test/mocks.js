const sinon = require('sinon');

const ctx = {
  redirect: sinon.stub(),
  throw: sinon.stub(),
  request: {},
  response: {},
  body: {},
  header: {},
  status: 0
};

const user = {
    'id': 42,
    'username': 'zbeeble',
    'full_name': 'Zaphod Beeblebrox',
    'profile_picture': 'http://distillery.s3.amazonaws.com/profiles/profile_42_75sq_1295469061.jpg',
};

const getUser = Object.assign({}, user, {
  'be_like': ['Yahweh', 'The Messiah', 'Godzilla'],
  'like_tags': ['landscape','adventure']
});
const modifiedUser = Object.assign({}, user, {
  'be_like': ['Yahweh', 'The Messiah'],
  'like_tags': ['landscape','adventure','beachvolley','power']
});
const authUser = Object.assign({}, getUser, {'access_token': 'ACCESS_TOKEN'});


const userUpdate = {
  'remove': {
    'be_like': [
      'Godzilla'
    ]
  },
  'add': {
    'like_tags': [
      'beachvolley',
      'power'
    ]
  }
}



module.exports = {
  user,
  ctx,
  authUser,
  getUser,
  userUpdate,
  modifiedUser
};
