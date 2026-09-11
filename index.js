import { registerRootComponent } from 'expo';

import App from './Frontend/App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
const express = require("express");
const NodeCache = require("node-cache");
const axios = require("axios");
const config = require("../config");

const transferRouter = express.Router();
const cache = new NodeCache({ stdTTL: 60 * 60 * 24 * 30 }); // 30 days

// Helper: get Spotify tracks for a user playlist (uses user access token)
async function getSpotifyTracksUser(playlistId, userAccessToken) {
  let tracks = [];
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;
  while (url) {
    const res = await axios.get(url, { headers: { Authorization: `Bearer ${userAccessToken}` } });
    for (const item of res.data.items) {
      if (item.track) {
        tracks.push({
          name: item.track.name,
          artists: item.track.artists.map(a => a.name).join(", ")
        });
      }
    }
    url = res.data.next;
  }
  return tracks;
}

// Helper: search YouTube (with caching)
async function searchYouTubeCached(query) {
  const key = `yt:${query}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(query)}&key=${config.YOUTUBE_API_KEY}&videoCategoryId=10`;
  const res = await axios.get(url);
  const videoId = res.data.items[0]?.id?.videoId || null;
  if (videoId) cache.set(key, videoId);
  return videoId;
}

// Create YouTube playlist for user
async function createYouTubePlaylist(googleAccessToken, title, description = "") {
  const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,status`;
  const res = await axios.post(url, {
    snippet: { title, description },
    status: { privacyStatus: "private" }
  }, {
    headers: { Authorization: `Bearer ${googleAccessToken}`, "Content-Type": "application/json" }
  });

  return res.data.id;
}

// Add item to playlist
async function addVideoToPlaylist(googleAccessToken, playlistId, videoId) {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet`;
  const body = {
    snippet: {
      playlistId,
      resourceId: { kind: "youtube#video", videoId }
    }
  };
  await axios.post(url, body, {
    headers: { Authorization: `Bearer ${googleAccessToken}`, "Content-Type": "application/json" }
  });
}

transferRouter.post("/", async (req, res) => {
  /*
    Expected body:
    {
      link: "<spotify playlist link>",
      type: "spotify_to_youtube",
      // optional: override api key or mode
    }
  */
  const { link, type } = req.body;
  const session = req.session || {};
  if (!session.spotify || !session.google) {
    return res.status(400).json({ error: "User must be logged in with Spotify and Google (YouTube) first" });
  }

  try {
    if (type === "spotify_to_youtube") {
      // extract playlist id (spotify)
      let playlistId;
      if (link.includes("playlist")) {
        playlistId = link.split("playlist/")[1].split("?")[0];
      } else {
        return res.status(400).json({ error: "Invalid Spotify playlist link" });
      }

      // 1) Get user Spotify tracks (requires user's spotify token; here we used session spotify.access_token from OAuth)
      const spotifyAccessToken = session.spotify.access_token;
      const tracks = await getSpotifyTracksUser(playlistId, spotifyAccessToken);

      // 2) Create YouTube playlist in user's account
      const googleAccessToken = session.google.access_token;
      const playlistTitle = `Transfer: ${playlistId}`;
      const ytPlaylistId = await createYouTubePlaylist(googleAccessToken, playlistTitle, "Imported from Spotify");

      // 3) For each track: search YouTube and add to playlist
      const results = [];
      for (const [i, t] of tracks.entries()) {
        const q = `${t.name} ${t.artists}`;
        const cachedVideoId = await searchYouTubeCached(q);

        if (!cachedVideoId) {
          results.push({ track: q, error: "not found" });
          continue;
        }

        // Add to playlist (handle per-second delay if needed to avoid quota spikes)
        await addVideoToPlaylist(googleAccessToken, ytPlaylistId, cachedVideoId);

        results.push({ track: q, youtubeId: cachedVideoId });
      }

      return res.json({ message: "Transfer completed", playlistId: ytPlaylistId, results });
    }

    return res.status(400).json({ error: "Unsupported transfer type" });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: err.response?.data || err.message });
  }
});

module.exports = transferRouter;
