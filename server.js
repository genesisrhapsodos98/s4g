const express = require('express')
const app = express()
app.set('view engine', 'ejs')
app.use(express.static('public'));

app.get('/', function (req, res) {
  //res.send('Hello World!')
  res.render('index');
})

app.post('/', function (req, res) {
  res.render('index');
})

app.listen(process.env.PORT || 5000, function() {
  console.log('Listening to Heroku\'s dynamic port and port 5000');
})