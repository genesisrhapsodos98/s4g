<<<<<<< HEAD
const express = require('express');
=======
// Import dependencies
const express = require('express')
>>>>>>> 8534bbf7325585bb1d85fef51f9a4e776d247ff6
const app = express();
var routes = require('./routes/index');
var category = require('./routes/category');

// Config router
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