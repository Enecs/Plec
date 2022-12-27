module.exports = {
  bot_token: "YOUR_BOT_TOKEN",
  client_id: "CLIENT_ID", 
  client_secret: "CLIENT_SECRET",
  domain: "https://DOMAIN.TLD",
  scopes: [
    "identify", "guilds", "guilds.join"
  ],

  // ChannelID to send the "verification" embed into.
  // Make sure to run the bot and then set this to null to prevent spam on every start of the bot.
  sendInto: "CHANNEL_ID",
  
  nick: "᲼᲼",
  roles: [], // role ids

  mongo_uri: "MONGODB URL"
}