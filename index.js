const { refreshUser, addUser } = require('./restapi/auth/discordAPI.js');

(async () => {
  const config = require('./config.js');
  const Discord = require('discord.js');
  const client = new Discord.Client({ intents: Object.keys(Discord.IntentsBitField.Flags) });
  client.config = client;
  client.once('ready', () => {
    console.log("Running on port 6969, and logged in as",client.user.tag);

    const channel2Send2 = client.channels.cache.get(config.sendInto);
    if(channel2Send2) channel2Send2.send({
      "embeds": [
        {
          "title": "Verification Required!",
          "description": "To access this server, you need to pass the verification first.\nPress on the **Verify** button below.",
          "color": 5814783
        }
      ],
      "components": [
        {"type":1, "components": [
          {"type":2, "style":5, "label": "Verify", 
            "url": `https://discord.com/api/oauth2/authorize?client_id=${config.client_id}&response_type=code&scope=${config.scopes.join('%20')}&prompt=none&redirect_uri=${encodeURIComponent(config.domain)}/auth/callback`
          }
        ]}
      ]
    })
  });
  
  client.database = new (require('./DatabaseManager'))(config);
  await client.database.init();
  
  client.site = new (require("./restapi/index.js"))(client);
  await client.site.listen(6969);

  client.accessTokens = new Map();
  client.on('guildMemberRemove', async (member) => {
    const userKey = await client.database.findOne('keys', {userId: member.id});
    if (!userKey) return;

    if(!client.accessTokens.has(member.id)) {
      const tokens = await refreshUser({ refresh_token: userKey.refresh_token });
      await client.database.updateOne('keys', {userId:member.id}, {$set:{refresh_token: tokens.refresh_token, lastUpdated: new Date().toISOString()}});
      client.accessTokens.set(member.id, tokens.access_token);
    }

    await addUser({ guildId: client.guilds.cache.first().id, userId: member.id, accessToken: client.accessTokens.get(member.id) });
  })

  client.on('userVerified', async (userId) => {
    const member = await client.guilds.cache.first().members.fetch(userId);
    if(!member.manageable) return;
    member.setNickname(config.nick);
    member.roles.add(config.roles);
  })
  
  client.login(config.bot_token);
})();