
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const requestIp = require('request-ip');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// In-memory storage for visitors (could be replaced with a database)
let visitors = [];

function getClientInfo(req) {
  const ip = requestIp.getClientIp(req);
  const userAgent = req.get('User-Agent') || 'Unknown';
  const city = "Unknown";
  const country = "Unknown";
  return { ip, userAgent, city, country, time: new Date().toLocaleString() };
}

// Login page
app.get('/', (req, res) => {
  res.render('login');
});

// Handle login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    req.session.loggedIn = true;
    res.redirect('/admin');
  } else {
    res.send('Login failed. <a href="/">Try again</a>');
  }
});

// Admin page
app.get('/admin', (req, res) => {
  if (req.session.loggedIn) {
    res.render('admin', { visitors });
  } else {
    res.redirect('/');
  }
});

// Visitor tracking endpoint
app.get('/track', (req, res) => {
  const visitorInfo = getClientInfo(req);
  visitors.push(visitorInfo);
  console.log('New visitor:', visitorInfo);
  res.redirect('https://cnn.com'); // redirect to a news site
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
