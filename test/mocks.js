const sinon = require('sinon');

const ctx = {
  redirect: sinon.stub(),
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

const authUser = Object.assign({}, user, {'access_token': 'ACCESS_TOKEN'});
const getUser = Object.assign({}, user, {
  'be_like': ['Yahweh', 'The Messiah', 'Godzilla'],
  'like_tags': ['landscape','adventure']
});


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
};
