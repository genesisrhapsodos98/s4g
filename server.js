// Import dependencies
const express = require('express');
const session = require('express-session');
const shortid = require('shortid');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const SteamAPI = require('steamapi');
const app = express();
const steamAPIKey = '6C891DD6268C16383F1F819BEEA902AA';
var root = require('./controllers/index');
var admin = require('./controllers/admin');
var user = require('./controllers/user');

var steam = new SteamAPI(steamAPIKey);

// Config
app.use(session({
  genid: function(req) {
    return shortid.generate();
  },
  secret: 's4g-website',
  resave: false,
  saveUninitialized: false,
  name: 's4g_session'
}));


app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.set('views', __dirname + "/views/pages");
app.use(express.static(__dirname + '/public'));
app.use('/', root);
app.use('/admin', admin);
app.use('/user', user);

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
  if (req.cookies.s4g_session && !req.session.user) {
      res.clearCookie('s4g_session');        
  }
  next();
});


// Start server
app.listen(process.env.PORT || 5000, () => {
  console.log('Listening to Heroku\'s dynamic port and port 5000');
})

module.exports = app;