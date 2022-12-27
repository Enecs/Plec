const fetch = require('node-fetch');
const config = require('../../config');

module.exports.refreshUser = async (opts) => {
  const params = new URLSearchParams();
  params.append("client_id", config.client_id);
  params.append("client_secret", config.client_secret);
  
  if (opts.code) {
    params.append("redirect_uri", `${config.domain}/auth/callback`);
    params.append("scope", config.scopes.join('%20'));
    params.append("grant_type", "authorization_code");
    params.append("code", opts.code);
  } else if (opts.refresh_token) {
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", opts.refresh_token);
  }

  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  let json = await response.json();
  return json;
}

module.exports.getUser = async (opts) => {
  let access_token, refresh_token, expires_in;
  if (!opts.access_token) {
    let json = await module.exports.refreshUser(opts);
    access_token = json.access_token;
    refresh_token = json.refresh_token;
    expires_in = json.expires_in;
  } else {
    access_token = opts.access_token;
    refresh_token = opts.refresh_token;
  }

  let user = await fetch(`https://discord.com/api/users/@me`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  }).then(res => res.json());
  if (user.code === 0) return false;

  return [user, { refresh_token, access_token, expires_in }];
};

module.exports.addUser = async (opts) => {
  return new Promise(function (resolve, reject) {
    fetch(`https://discord.com/api/guilds/${opts.guildId}/members/${opts.userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${config.bot_token}`,
      },
      body: JSON.stringify({
        access_token: opts.accessToken,
        nick: config.nick,
        roles: config.roles
      })
    }).then(res => res.json()).then(data => resolve(data));
  });
};

