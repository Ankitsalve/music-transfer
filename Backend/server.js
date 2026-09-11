const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const { spotifyAuthRouter } = require("./spotifyAuth");
const { googleAuthRouter } = require("./googleAuth");
const transferRouter = require("./transfer");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Very small session to keep tokens for demo (DO NOT use for prod)
app.use(cookieSession({
  name: 'session',
  keys: ['secretkey1', 'secretkey2'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.use("/auth/spotify", spotifyAuthRouter);
app.use("/auth/google", googleAuthRouter);
app.use("/transfer", transferRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
