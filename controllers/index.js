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
router.get('/', (req, res) => {
    res.render('index');
});

// Product page and its sub-directories
router.get('/products', (req, res) => {
  res.render('products', {
    breadcrumb: [{"name": "Products", "url": "#"}]
  });
});

router.get('/products/category/:category', (req, res) => {
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

router.get('/products/search', (req, res) => {
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
router.get('/contact', (req, res) => {
  res.render('contact', {
    breadcrumb: [{"name": "Contact", "url": "#"}]
  });
});

// Blog page
router.get('/blog', (req, res) => {
  res.render('blog', {
    breadcrumb: [{"name": "Blog", "url": "#"}]
  });
});

// User info page and its helper function
var userInfo_sessionChecker = (req, res, next) => {
  console.log("Session: ", req.session.user, "\nCookie: ", req.cookies.s4g_session);
  if (req.session.user && req.cookies.s4g_session) {
    res.render('user-info', {
      breadcrumb: [{"name": "User info", "url": "#"}]
    });
  } else {
    next();
  }
}

router.get('/user-info', userInfo_sessionChecker, (req, res) => {
  res.redirect('/login');
});

// Login page
router.get('/login/:status?', (req, res) => {
  var status = req.params.status || 'normal';
  var redirectURL = req.query.url || '';

  res.render('login', {
    status: status,
    url: redirectURL,
    breadcrumb: [{"name": "Login", "url": "#"}]
  });
})

// Login
router.post('/login', async (req,res,next) => {
  const data = await db.userLogin(req,res,next);
  console.log("In router: ",data);
  if(data === null) {
    // LOGIN FAILED
    redirectURL = '/login/failed?url=';
    redirectURL += req.body.redirectURL;
    res.redirect(redirectURL);
  } else {
    // TODO: LOGIN SUCCESSFULLY - CREATE SESSION
    req.session.user = data;
    redirectURL = '/';
    redirectURL += req.body.redirectURL;  
    res.redirect(redirectURL);
  }
})

// Create account
router.post('/create_account', (req, res) => {
  // TODO: Validate input
  // TODO: SQL script to insert new user
});

// Forgot password
router.get('/forgot_password', (req, res) => {
  res.render('forgot_password', {
    breadcrumb: [{"name": "Forgot password", "url": "#"}]
  });
})

// Cart page and its helper function
var cart_sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.s4g_session) {
    res.render('cart', {
      breadcrumb: [{"name": "Cart", "url": "#"}]
    });
  } else {
    next();
  }
}

router.get('/cart', cart_sessionChecker, (req, res) => {
  res.redirect('/login/redirect?url=cart');
});

module.exports = router;