// Import dependencies
var express = require('express');
var session = require('express-session');
var shortid = require('shortid');
var router = express.Router();

var db = require('../models/queries');

// Config router
router.use(express.static(__dirname + '/public'));
router.use('images', express.static(__dirname + '../public/images'));

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
router.get('/', async (req, res) => {
    var role = getRole(req);
    var categories = await db.getAllCategory();
    // TODO: fix these queries below, not intended
    var newProducts = await db.getNewProducts()
    var hotProducts = await db.getHotProducts();
    if(newProducts.rowCount == 0){
      newProducts.rows = null;
    }
    if(hotProducts.rowCount == 0) {
      hotProducts.rows = null;
    }

    res.render('index', {
      newProducts: newProducts.rows,
      hotProducts: hotProducts.rows,
      user: req.session.user,
      role: role,
      categories: categories.rows,
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

  console.log("CATEGORIZE: ", Products.rows);

  if(Products.rowCount == 0){
    Products.rows = null;
  }

  var categories = await db.getAllCategory();
  // Render page
  res.render('products', {
    // products: products,
    user: req.session.user,
    products: Products.rows,
    action: "categorize",
    categories: categories.rows,
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
  var categories = await db.getAllCategory();
  res.render('products', {
    // products: products,
    user: req.session.user,
    products: Product.rows,
    action: "search",
    q: q,
    categories: categories.rows,
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
router.get('/contact', async (req, res) => {
  var categories = await db.getAllCategory();
  res.render('contact', {
    role: getRole(req),
    page: 'contact',
    categories: categories.rows,
    breadcrumb: [{"name": "Contact", "url": "#"}]
  });
});

var login_sessionChecker = async (req, res, next) => {
  if (req.session.user && req.cookies.s4g_session) {
    var redirectURL;
    if (req.session.user.Role == "ADMIN") redirectURL = '/admin'
    else redirectURL = '/user';
  } else {
    next();
  }
}

// Login page
router.get('/login*', login_sessionChecker);

router.get('/login/:status?', async (req, res) => {
  var status = req.params.status || 'normal';
  var redirectURL = req.query.url || '';
  var categories = await db.getAllCategory();
  res.render('login', {
    role: getRole(req),
    page: "login",
    status: status,
    categories: categories.rows,
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
  req.body.uuid = shortid.generate();
  var data = await db.userCreate(req,res,next);

  if(data.user_ins.split(":")[0] === 'FAIL'){
    // USER CREATION FAILED
    res.redirect('/login/failed');
  } else {
    // TODO: USER CREATED SUCCESSFULLY - CREATE SESSION

    var cart = db.create
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
var cart_sessionChecker = async (req, res, next) => {
  if (!(req.session.user && req.cookies.s4g_session)) {
    res.redirect('/login/redirect?url=cart');
  } else {
    next();
  }
}

router.all('/cart*', cart_sessionChecker);

router.get('/cart', async (req, res) => {
  res.redirect('/cart/'+ req.session.user.UID);
});

router.get('/cart/:uuid', async (req, res) => {
  var cartUID = req.params.uuid;
  var userUID = req.session.user.UID;
  console.log("Cart UID: ",cartUID,"\nUser UID: ",userUID);
  if (cartUID != userUID) res.redirect('/cart/'+userUID);
  var cart = await db.getUserCart(userUID);

  console.log(cart.rows);

  var products = []; 
  if (cart) for (item of cart.rows) {
    var product = await db.getProductfromID(item.PID);
    products.push(product.rows[0]);
  };

  var categories = await db.getAllCategory();
  res.render('cart', {
    cart: cart.rows,
    products: products,
    categories: categories.rows,
    owner: req.session.user,
    role: getRole(req),
    page: 'cart',
    breadcrumb: [
      {"name": "Cart", "url": "#"}
    ]
  });
});

router.get('/cart/:uuid/add', async (req, res) => {
  var uid = req.params.uuid;
  var pid = req.query.id;
  // TODO: Add product to cart

  var result = await db.addProducttoCart(uid,pid,1);

  if(result.rowCount){
    res.redirect('/cart');
  } else {
  };
});

router.get('/cart/:uuid/remove', async (req, res) => {
  var uid = req.params.uuid;
  var pid = req.query.pid;
  // TODO: Remove produc t from cart
  
  var result = await db.addProducttoCart(uid,pid,0);

  if(result.rowCount){
    res.redirect('/cart');
  } else{
  };
});

router.get('/logout', (req, res) => {
  if (req.session.user && req.cookies.s4g_session) {
    res.clearCookie('s4g_session');
    res.redirect('/');
  } else {
    res.redirect('/');
  }
});

module.exports = router;