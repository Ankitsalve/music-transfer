const axios = require("axios");
const config = require("../config");

// GET SPOTIFY TOKEN
async function getSpotifyToken() {
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");

  const tokenRes = await axios.post("https://accounts.spotify.com/api/token", params, {
    headers: {
      Authorization: "Basic " + Buffer.from(config.SPOTIFY_CLIENT_ID + ":" + config.SPOTIFY_CLIENT_SECRET).toString("base64"),
    },
  });

  return tokenRes.data.access_token;
}

// GET PLAYLIST TRACKS
async function getSpotifyTracks(playlistId) {
  const token = await getSpotifyToken();

  const res = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return res.data.items.map(item => ({
    name: item.track.name,
    artist: item.track.artists[0].name
  }));
}

module.exports = { getSpotifyTracks };



