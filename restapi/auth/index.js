const { Router } = require("express");
const config = require("../../config");

const { getUser } = require('./discordAPI');

const route = Router();

route.get("/login", async (req, res, next) => {
  const redirectURL = `https://discord.com/api/oauth2/authorize?client_id=${req.config.client_id}&response_type=code&scope=${req.config.scopes.join('%20')}&prompt=none&redirect_uri=${encodeURIComponent(req.config.domain)}/auth/callback`;
  if(req.query.json) return res.send({ url: redirectURL });
  res.redirect(redirectURL);
});

route.get("/callback", async (req, res, next) => {
  if (!req.query.code) return res.send({message: "No code provided."});
  const code = req.query.code;
  const result = await getUser({code});
  if (!result) return res.redirect('/auth/login');
  const [user, tokens] = result;

  let userKeys = await req.client.database.findOne('keys', {userId: user.id});
  if(!userKeys) userKeys = await req.client.database.insertOne('keys', {userId: user.id, refresh_token: tokens.refresh_token, lastUpdated: new Date().toISOString()});
  else await req.client.database.updateOne('keys', {userId:user.id}, {$set:{refresh_token: tokens.refresh_token, lastUpdated: new Date().toISOString()}});
  req.client.emit("userVerified", user.id);
  
  return res.send(`<script>alert("You have successfully verified yourself! You may now close this window and return to discord.")</script>`);
});

module.exports = route;
