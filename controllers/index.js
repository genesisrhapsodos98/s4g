// Import dependencies
var express = require('express');
var session = require('express-session');
var crypto = require('crypto');
var router = express.Router();

var db = require('../models/queries');

// Config router
router.use(express.static(__dirname + '/public'));
router.use('images', express.static(__dirname + '/public/images'));

// Helper functions
function getRole(req) {
  var role = "GUEST";
  if (req.session.user && req.cookies.s4g_session) {
    switch (req.session.user.Role) {
      case "ADMIN":
        role = "ADMIN";
        break;
      case "MEMBER":
        role = "MEMBER";
        break;
      default:
        role = "UNDEFINED";
    }
  }
  return role;
}

// Routing

// Homepage
router.get('/', (req, res) => {
    var role = getRole(req);
    res.render('index', {
      role: role,
      page: 'home'
    });
});

// Product page and its sub-directories
router.get('/products', (req, res) => {
  res.redirect('/products/category/all');
});

router.get('/products/category/:category', async (req, res) => {
  var category = req.params.category;
  // TODO: Query games from selected category
  // var products = queryFunction(category);

  if(category == 'all'){
    var Products = await db.getAllProduct(); 
  }else{
    var Products = await db.getProductfromCategory(category);
  }

  console.log(Products);

  if(Products.rowCount == 0){
    Products.rows = null;
  }

  // Render page
  res.render('products', {
    // products: products,
    products: Products.rows,
    action: "categorize",
    category: category.charAt(0).toUpperCase() + category.slice(1),
    role: getRole(req),
    page: 'games',
    breadcrumb: [
      {"name": "Products", "url": "/products"},
      {"name": "Category", "url": "#"},
      {"name": category, "url": "#"}
    ]
  });
});

router.get('/products/search', async (req, res) => {
  var q = req.query.q;
  // TODO: Query games from entered search key
  // var products = queryFunction(q);
  var Product = await db.searchProduct(q);

  console.log(Product);

  // Render page
  res.render('products', {
    // products: products,
    products: Product.rows,
    action: "search",
    q: q,
    role: getRole(req),
    page: 'games',
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
    role: getRole(req),
    page: 'contact',
    breadcrumb: [{"name": "Contact", "url": "#"}]
  });
});

// Login page
router.get('/login/:status?', (req, res) => {
  var status = req.params.status || 'normal';
  var redirectURL = req.query.url || '';

  res.render('login', {
    role: getRole(req),
    page: "login",
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
    var role = req.session.user.Role;
    if (role == "MEMBER") {
      redirectURL = '/';
      redirectURL += req.body.redirectURL;  
      res.redirect(redirectURL);
    } else if (role == "ADMIN") {
      res.redirect('/admin');
    } else { // UNDEFINED ROLE
      res.redirect('/');
    }
    
  }
})

// Create account
router.post('/create_account', async function(req, res,next) {
  // TODO: Validate input
  // TODO: SQL script to insert new user
  req.body.uuid = crypto.randomBytes(40).toString('hex');
  const data = await db.userCreate(req,res,next);
  
  console.log("In router: ",data);
  if(data.split(":")[0] === 'FAIL'){
    // USER CREATION FAILED
    res.redirect('/login/failed');
  } else {
    // TODO: USER CREATED SUCCESSFULLY - CREATE SESSION
    var newUser = {
      "UID": req.body.uuid,
      "Username": req.body.username,
      "Password": req.body.password,
      "Role": 'MEMBER'
    }
    req.session.user = newUser;
    res.redirect('/');
  }
});

// Cart page and its helper function
var cart_sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.s4g_session) {
    var cartUID = req.params.uuid;
    var userUID = req.session.user.UID;
    if (cartUID != user.UID) cartUID = userUID;
    res.redirect('cart/' + cartUID);
  } else {
    next();
  }
}

router.get('/cart/:uuid?', cart_sessionChecker, (req, res) => {
  res.redirect('/login/redirect?url=cart');
});

router.get('/cart/:uuid?')
module.exports = router;