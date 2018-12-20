const express = require('express')
const app = express()
var routes = require('./routes/index');
var category = require('./routes/category');

app.set('view engine', 'ejs');
app.set('views', __dirname + "/views/pages");

app.use(express.static(__dirname + '/public'));
app.use('/', routes);
app.use('/category', category);

app.listen(process.env.PORT || 5000, function() {
  console.log('Listening to Heroku\'s dynamic port and port 5000');
})

module.exports = app;