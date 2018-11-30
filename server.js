const express = require('express')
const app = express()
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.render('index', { onLogin : "onLogin();"});
})

app.post('/', function (req, res) {

})

app.get('/products', function (req, res) {
  //res.send('Hello World!')
  res.render('products');
})

app.get('/contact', function (req, res) {
  //res.send('Hello World!')
  res.render('contact');
})

app.get('/signup', function (req, res) {
  //res.send('Hello World!')
  res.render('signup');
})

app.get('/forgotpassword', function (req, res) {
  res.render('forgotpassword');
})

/*app.post('/', function (req, res) {
  res.render('index');
})*/

app.listen(process.env.PORT || 5000, function() {
  console.log('Listening to Heroku\'s dynamic port and port 5000');
})