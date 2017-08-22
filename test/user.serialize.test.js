const mocks = require('./mocks.js');
const SerializedUser = require('../utils/user-serializer');

describe('serialize', function () {
  it('should return the user properties', async function () {
    const serializedUser = await SerializedUser.serialize(mocks.extraPropsUser);
    Object.keys(serializedUser).should.not.include('foo');
    Object.keys(serializedUser).should.not.include('access_token');
    Object.keys(serializedUser).should.have.members(mocks.userSerializedProps);
  });
});
describe('serializeWithToken', function () {
  it('should return the user properties with the access token', async function () {
    const serializedUser = await SerializedUser.serializeWithToken(mocks.extraPropsUser);
    Object.keys(serializedUser).should.include('access_token');
    Object.keys(serializedUser).should.not.include('foo');
    Object.keys(serializedUser).should.include.members(mocks.userSerializedProps);
  });
});
