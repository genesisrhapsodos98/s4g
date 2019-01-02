// Import dependencies
var express = require('express');
var session = require('express-session');
var router = express.Router();

var db = require('../models/queries');


// Config router
router.use(express.static(__dirname + '/public'));
router.use('images', express.static(__dirname + '/public/images'));

// Routing
router.get('/', function(req, res) {
    res.render('index');
});

router.get('/products', function (req, res) {
  res.render('products', {
    title: "Products"
  });
});

router.get('/contact', function (req, res) {
  res.render('contact', {
    title: "Contact"
  });
});

router.get('/blog', function (req, res) {
  res.render('blog', {
    title: "Blog"
  });
});

var userInfo_sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    res.render('user-info', {
      title: "User info"
    });
  } else {
    next();
  }
}

router.get('/user-info', userInfo_sessionChecker, function(req, res) {
  res.redirect('/login');
});

router.get('/login', function (req, res) {
  var _redirected = req.query.redirected;
  res.render('login', {
    redirected: _redirected,
    title: "Login"
  });
})

router.get('/forgotpassword', function (req, res) {
  res.render('forgotpassword');
});

var cart_sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    res.render('cart', {
      title: "Cart"
    });
  } else {
    next();
  }
}

router.get('/cart', cart_sessionChecker, function(req, res) {
  res.redirect('/login?redirected=true');
});

/*router.post('/', function (req, res) {
  res.render('index');
})*/

// RESTful
router.post('/login/username',db.userLogin);


module.exports = router;