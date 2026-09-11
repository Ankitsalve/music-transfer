const axios = require("axios");
const config = require("../config");

// SEARCH YouTube VIDEO
async function searchYouTube(query) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${config.YOUTUBE_API_KEY}`;

  const res = await axios.get(url);
  return res.data.items[0]?.id?.videoId;
}

module.exports = { searchYouTube };
