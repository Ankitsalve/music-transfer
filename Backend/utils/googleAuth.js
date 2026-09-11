const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
const config = require("./config");

const googleAuthRouter = express.Router();

// Scopes for managing YouTube playlists
const scopes = [
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "profile",
  "email",
].join(" ");

googleAuthRouter.get("/login", (req, res) => {
  const url =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    querystring.stringify({
      client_id: config.GOOGLE_CLIENT_ID,
      redirect_uri: config.GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: scopes,
      access_type: "offline",
      prompt: "consent"
    });

  res.redirect(url);
});

googleAuthRouter.get("/callback", async (req, res) => {
  const code = req.query.code;
  try {
    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      querystring.stringify({
        code,
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        redirect_uri: config.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code"
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    // Save tokens in session (for demo only)
    req.session.google = {
      access_token: tokenRes.data.access_token,
      refresh_token: tokenRes.data.refresh_token,
      expires_in: tokenRes.data.expires_in,
    };

    res.redirect(config.FRONTEND_URL + "/?google_auth=success");
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.redirect(config.FRONTEND_URL + "/?google_auth=error");
  }
});

// return google token info
googleAuthRouter.get("/token", (req, res) => {
  res.json({ google: req.session.google || null });
});





module.exports = { googleAuthRouter };
