// Import dependencies
var express = require('express');
var session = require('express-session');
var router = express.Router();

var db = require('../models/queries');

// Config router
router.use(express.static(__dirname + '/public'));
router.use('images', express.static(__dirname + '/public/images'));

// Routing

// Homepage
router.get('/', function(req, res) {
    res.render('index');
});

// Product page and its sub-directories
router.get('/products', function (req, res) {
  res.render('products', {
    breadcrumb: [{"name": "Products", "url": "#"}]
  });
});

router.get('/products/category/:category', function(req, res) {
  var category = req.params.category;
  // TODO: Query games from selected category

  // Render page
  res.render('products', {
    breadcrumb: [
      {"name": "Products", "url": "/products"},
      {"name": "Category", "url": "#"},
      {"name": category, "url": "#"}
    ]
  });
});

router.get('/products/search', function(req, res) {
  var q = req.query.q;
  // TODO: Query games from entered search key

  // Render page
  res.render('products', {
    breadcrumb: [
      {"name": "Products", "url": "/products"},
      {"name": "Search", "url": "#"},
      {"name": q, "url": "#"}
    ]
  });
});

// Contact page
router.get('/contact', function (req, res) {
  res.render('contact', {
    breadcrumb: [{"name": "Contact", "url": "#"}]
  });
});

// Blog page
router.get('/blog', function (req, res) {
  res.render('blog', {
    breadcrumb: [{"name": "Blog", "url": "#"}]
  });
});

// User info page and its helper function
var userInfo_sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    res.render('user-info', {
      breadcrumb: [{"name": "User info", "url": "#"}]
    });
  } else {
    next();
  }
}

router.get('/user-info', userInfo_sessionChecker, function(req, res) {
  res.redirect('/login');
});

// Login page
router.get('/login/:status?', function (req, res) {
  var status = req.params.status || 'normal';
  res.render('login', {
    status: status,
    breadcrumb: [{"name": "Login", "url": "#"}]
  });
})

// Login
router.post('/login', async function(req,res,next){
  const data = await db.userLogin(req,res,next);
  console.log("In router: ",data);
  if(data === null){
    // LOGIN FAILED
    res.redirect('/login/failed');
  } else {
    // TODO: LOGIN SUCCESSFULLY - CREATE SESSION
    res.redirect('/');
  }
})

// Create account
router.post('/create_account', async function(req, res,next) {
  // TODO: Validate input
  // TODO: SQL script to insert new user
  const data = await db.userCreate(req,res,next);
  console.log("In router: ",data);
  if(data.state === 'failed'){
    // USER CREATION FAILED
    res.redirect('/login/failed');
  } else {
    // TODO: USER CREATED SUCCESSFULLY - CREATE SESSION
    res.redirect('/');
  }
});

// Forgot password
router.get('/forgot_password', function(req, res) {
  res.render('forgot_password', {
    breadcrumb: [{"name": "Forgot password", "url": "#"}]
  });
})

// Cart page and its helper function
var cart_sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    res.render('cart', {
      breadcrumb: [{"name": "Cart", "url": "#"}]
    });
  } else {
    next();
  }
}

router.get('/cart', cart_sessionChecker, function(req, res) {
  res.redirect('/login/redirected');
});

module.exports = router;