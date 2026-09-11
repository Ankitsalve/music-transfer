module.exports = {
    PORT: process.env.PORT || 5000,
    BASE_URL: process.env.BASE_URL || "http://localhost:5000",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:19006", // Expo default
    SPOTIFY_CLIENT_ID: "cf1162772f134b2994fc407cf5ce861b",
    SPOTIFY_CLIENT_SECRET: "ed87fbe1e92f43b78a1392f22c94e2e1",
    SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI || "http://localhost:5000/auth/spotify/callback",
     GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "YOUR_GOOGLE_CLIENT_SECRET",
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/auth/google/callback",
    YOUTUBE_API_KEY: "AIzaSyCkK9jlsWYfGtPwHzkBm2hDA6e4l_7VDT4"
};
