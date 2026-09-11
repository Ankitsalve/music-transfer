Auth
const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
const config = require("./config");

const spotifyAuthRouter = express.Router();

// 1) Redirect user to Spotify auth
spotifyAuthRouter.get("/login", (req, res) => {
  const scopes = [
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-read-email",
    "playlist-modify-private",
    "playlist-modify-public"
  ].join(" ");

  const url =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: config.SPOTIFY_CLIENT_ID,
      scope: scopes,
      redirect_uri: config.SPOTIFY_REDIRECT_URI,
      show_dialog: true
    });

  res.redirect(url);
});

// 2) Callback — exchange code for tokens
spotifyAuthRouter.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  try {
    const tokenRes = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        code,
        redirect_uri: config.SPOTIFY_REDIRECT_URI,
        grant_type: "authorization_code"
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(config.SPOTIFY_CLIENT_ID + ":" + config.SPOTIFY_CLIENT_SECRET).toString("base64")
        }
      }
    );

    // Save tokens in session (for demo only)
    req.session.spotify = {
      access_token: tokenRes.data.access_token,
      refresh_token: tokenRes.data.refresh_token,
      expires_in: tokenRes.data.expires_in,
    };

    // redirect back to frontend
    res.redirect(config.FRONTEND_URL + "/?spotify_auth=success");
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.redirect(config.FRONTEND_URL + "/?spotify_auth=error");
  }
});

// 3) Endpoint to get stored spotify token (for frontend to verify)
spotifyAuthRouter.get("/token", (req, res) => {
  res.json({ spotify: req.session.spotify || null });
});

module.exports = { spotifyAuthRouter };
