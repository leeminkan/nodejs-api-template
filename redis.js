const bluebird = require('bluebird');
const redis = require('redis');
const keys = require('./config/index');

bluebird.promisifyAll(redis);

const client = redis.createClient({
  host: keys.REDIS_HOST || 'localhost',
  port: keys.REDIS_PORT || 6379,
});

client.on('connect', function () {
  client.flushdb(function (err, succeeded) {
    if (err) {
      console.log(err);
      return;
    }
  });
  console.log(`Redis connected at ${keys.REDIS_HOST || 'localhost'}:${keys.REDIS_PORT || 6379}`);
});

//log error to the console if any occurs
client.on("error", (err) => {
  console.log(err);
});

module.exports = client;