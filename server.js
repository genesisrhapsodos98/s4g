// Import dependencies
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
var routes = require('./routes/index');
var category = require('./routes/category');

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
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', __dirname + "/views/pages");
app.use(express.static(__dirname + '/public'));
app.use('/', routes);
app.use('/category', category);

// Start server
app.listen(process.env.PORT || 5000, function() {
  console.log('Listening to Heroku\'s dynamic port and port 5000');
})

module.exports = app;