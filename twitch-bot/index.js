// import stuff
const tmi = require('tmi.js');
const axios = require('axios');

// make a twitch bot tutorial below
// https://dev.twitch.tv/docs/authentication/register-app/
// https://twitchtokengenerator.com
const BOT_USERNAME = 'your_username';
const BOT_OAUTH_TOKEN = 'your_oauth_token';
const CHANNELS = ["channel_name"];

const MRAPI_URL = "https://mrapi.org/api/";

// ----

// make a new client with the username and oath token and channels
const client = new tmi.Client({
  options: { debug: true },
  connection: {
    secure: true,
    reconnect: true
  },
  identity: {
    username: BOT_USERNAME,
    password: BOT_OAUTH_TOKEN
  },
  channels: CHANNELS
});

// connect to client
client.connect();

client.on('message', async (channel, tags, message, self) => {
  // ignore the bots messages
  if (self) return;

  // get all the words in the message
  const args = message.trim().split(" ");
  const command = args[0].toLowerCase();

  // check if the message is the rank command
  if (command === '!rank') {
    // make sure the username is set
    if (args.length < 2) {
      client.say(channel, `@${tags.username}, please provide a username! Example: !rank ${channel}`);
      return;
    }
    // some players can have spaces in their names so get everything after !rank to be sure
    const playerName = args.slice(1).join(" ");
    try {
      // get player id by their name
      const playerIdResponse = await axios.get(`${MRAPI_URL}player-id/${playerName}`);
      const playerId = playerIdResponse.data.id;

      // player doesnt exist so return not found
      if (!playerId) {
        client.say(channel, `@${tags.username}, player not found.`);
        return;
      }

      // get the player stats
      const playerDataResponse = await axios.get(`${MRAPI_URL}/player/${playerId}`);
      const rank = playerDataResponse.data.stats?.rank ?? "Unknown";

      // return rank
      client.say(channel, `@${tags.username}, ${playerName}'s rank is: ${rank}`);
    } catch (error) {
      //something bad happened so tell them
      console.error("something went wrong:", error.message);
      client.say(channel, `@${tags.username}, failed to retrieve rank. Try again later.`);
    }
  }
});
