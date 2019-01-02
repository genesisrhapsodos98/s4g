// Import dependencies
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
var routes = require('./controllers/index');

// Config
app.use(session({
  key: 'user_sid',
  genid: function(req) {
    return crypto.randomBytes(20).toString('hex');
  },
  secret: 's4g-website',
  resave: false,
  saveUninitialized: false,
  name: 's4g-cookie-id'
}));


app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.set('views', __dirname + "/views/pages");
app.use(express.static(__dirname + '/public'));
app.use('/', routes);

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
      res.clearCookie('user_sid');        
  }
  next();
});


// Start server
app.listen(process.env.PORT || 5000, function() {
  console.log('Listening to Heroku\'s dynamic port and port 5000');
})

module.exports = app;