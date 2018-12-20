var express = require('express');
var router = express.Router();


router.use(express.static(__dirname + '/public'));
router.use('images', express.static(__dirname + '/public/images'));

router.get('/', function(req, res) {
    res.render('index', {title: 'Express'});
});

router.get('/', function (req, res) {
  res.render('index', { onLogin : "onLogin();"});
})

router.post('/', function (req, res) {

})

router.get('/products', function (req, res) {
  res.render('products');
})

router.get('/contact', function (req, res) {
  res.render('contact');
})

router.get('/blog', function (req, res) {
  res.render('blog');
})

router.get('/signup', function (req, res) {
  res.render('signup');
})

router.get('/forgotpassword', function (req, res) {
  res.render('forgotpassword');
})

router.get('/cart', function(req, res) {
  res.render('cart');
})

/*router.post('/', function (req, res) {
  res.render('index');
})*/

module.exports = router;