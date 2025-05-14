
// Import required libraries
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Set up EJS as the templating engine
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Spotify API credentials from .env file
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
});

// Spotify access token (will be retrieved on the initial route)
let accessToken = '';

// Authentication function
const authenticateSpotify = async () => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    accessToken = data.body['access_token'];
    spotifyApi.setAccessToken(accessToken);
  } catch (error) {
    console.error('Error fetching access token', error);
  }
};

// Set up routes
app.get('/', async (req, res) => {
  try {
    const trackData = await spotifyApi.getMyCurrentPlayingTrack();
    const track = trackData.body.item || null;
    res.render('index', { track });
  } catch (error) {
    console.error('Error fetching track data', error);
    res.render('index', { track: null });
  }
});

// Route to control Spotify playback actions
app.get('/play', async (req, res) => {
  await spotifyApi.play();
  res.redirect('/');
});

app.get('/pause', async (req, res) => {
  await spotifyApi.pause();
  res.redirect('/');
});

app.get('/skip', async (req, res) => {
  await spotifyApi.skipToNext();
  res.redirect('/');
});

app.get('/previous', async (req, res) => {
  await spotifyApi.skipToPrevious();
  res.redirect('/');
});

// Initialize Spotify authentication
authenticateSpotify();

// Start server
app.listen(port, () => {
  console.log(`Spotify app running at http://localhost:${port}`);
});
