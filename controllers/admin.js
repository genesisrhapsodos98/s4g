// Import dependencies
var express = require('express');
var session = require('express-session');
var fs = require('fs');
var path = require('path');
var isImage = require('is-image');
var SteamAPI = require('steamapi');
var router = express.Router();

const steamAPIKey = '6C891DD6268C16383F1F819BEEA902AA';
var steam = new SteamAPI(steamAPIKey);

var db = require('../models/queries');

// Config router
router.use(express.static(__dirname + '../public'));
router.use('/images', express.static(__dirname + '../public/images'));

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

var admin_sessionChecker = (req, res, next) => {
  if (!(req.session.user && req.cookies.s4g_session && req.session.user.Role == "ADMIN")) {
    res.redirect('/login/redirect?url=admin');
  } else {
    next();
  }
}

// Routing
router.all('*', admin_sessionChecker);

router.get('/', (req, res) => {
  res.render('admin/index', {
    owner: req.session.user,
    role: getRole(req),
    page: 'admin',
    tab: 'dashboard',
    breadcrumb: [{"name": "Admin", "url": "#"}]
  });
});

router.get('/change-avatar', (req, res) => {
  var uploadStatus = req.query.upload || null;
  res.render('admin/change-avatar', {
    uploadStatus: uploadStatus,
    owner: req.session.user,
    role: getRole(req),
    page: 'admin-change-avatar',
    tab: 'dashboard',
    breadcrumb: [
      {"name": "Admin", "url": "/admin"},
      {"name": "Change avatar", "url": "#"}
    ]
  });
});

router.get('/change-password', (req, res) => {
  var status = req.query.status || null;

  res.render('admin/change-password', {
    status: status,
    owner: req.session.user,
    role: getRole(req),
    page: 'admin-change-password',
    tab: 'dashboard',
    breadcrumb: [
      {"name": "Admin", "url": "/admin"},
      {"name": "Change password", "url": "#"}
    ]
  });
});

router.post('/change-password', async (req, res) => {
  var oldPass = req.body.old_pass;
  var newPass = req.body.new_pass;
  var reNewPass = req.body.re_new_pass;
  var uid = req.body.uid;

  console.log(uid,oldPass,newPass);
  /* TODO:
    Check if new pass == re new pass
    If true, call query
    If false, redirect to /admin/change-password?status=failed
  */
 if(newPass != reNewPass) res.redirect('/admin/change-password?status=failed');

  var result = await db.changePassword(uid,newPass,oldPass);
  console.log(result);

  if(result === null) res.redirect('/admin/change-password?status=failed');

  if(result.rowCount){
    res.redirect('/admin');
  }else{
    res.redirect('/admin/change-password?status=failed');
  };
  // 
})

router.get('/products/add/steamid', (req, res) => {
  var status = req.query.status || null;
  res.render('admin/add_products_steamid', {
    status: status,
    owner: req.session.user,
    role: getRole(req),
    page: 'admin-products-add',
    tab: 'ecommerce',
    breadcrumb: [
      {"name": "Admin", "url": "/admin"},
      {"name": "Products", "url": "#"}
    ]
  });
});

router.get('/products/add/s4g', async (req, res) => {
  var steamid = req.query.steamid;
  var categories = await db.getAllCategory();
  categories = categories.rows;
  try {
    var gameInfo = await steam.getGameDetails(steamid);
  } catch (err) {
    console.log('SteamID not found.');
    res.redirect('/admin/products/add/steamid?status=failed');
  }

  res.render('admin/add_products_s4g', {
    steamid: steamid,
    categories: categories,
    gameInfo: gameInfo,
    owner: req.session.user,
    role: getRole(req),
    page: 'admin-products-add',
    tab: 'ecommerce',
    breadcrumb: [
      {"name": "Admin", "url": "/admin"},
      {"name": "Products", "url": "#"}
    ]
  });
});

router.post('/products/add/s4g', async(req, res) => {
  // Get parameters from ejs
  var steamid = req.body.steamid;
  var name = req.body.product_name;
  var price = req.body.product_price;
  // TODO: Test if isHot and isNew are booleans
  var isHot = req.body.product_ishot;
  var isNew = req.body.product_isnew;

  isHot?isHot=true:isHot=false;
  isNew = isNew?true:false;

  console.log([isHot,isNew]);

  try {
    var gameInfo = await steam.getGameDetails(steamid);
  } catch (err) {
    console.log('SteamID not found.');
    res.redirect('/admin/products/add/steamid?status=failed');
  }
  
  var header_image = gameInfo.header_image;

  var addNewCategory = (req.body.product_category == "addnew" ? true : false);
  if (addNewCategory) {
    var name = req.body.category_name;
    var endpoint = req.body.endpoint;
    // TODO: Add new category to db
    var newcategoryresult = await db.addNewCategory(name,endpoint);

    if(newcategoryresult === null){
      console.log('Can not create new category.');
      res.redirect('/admin/products/add/steamid?status=failed');
    }
  }
  
  var category = addNewCategory ? req.body.category_name : req.body.product_category;
  // TODO: Call function to add product to db

  var result = await db.addProduct(steamid,name,price,category,isNew,isHot,header_image);
  
  if(result.rowCount){
    res.redirect('/admin/?add=success');
  } else{
    res.redirect('/admin/products/add/steamid?status=failed');
  };
});

router.get('/products/edit', async (req, res) => {
  res.render('admin/edit_products', {
    owner: req.session.user,
    role: getRole(req),
    page: 'admin-products-edit',
    tab: 'ecommerce',
    breadcrumb: [
      {"name": "Admin", "url": "/admin"},
      {"name": "Products", "url": "#"}
    ]
  });
});

router.get('/products/remove', async (req, res) => {
  res.render('admin/remove_products', {
    owner: req.session.user,
    role: getRole(req),
    page: 'admin-products-remove',
    tab: 'ecommerce',
    breadcrumb: [
      {"name": "Admin", "url": "/admin"},
      {"name": "Products", "url": "#"}
    ]
  });
});

router.get('/orders', (req, res) => {
  res.render('admin/orders', {
    owner: req.session.user,
    role: getRole(req),
    page: 'admin-orders',
    tab: 'ecommerce',
    breadcrumb: [
      {"name": "Admin", "url": "/admin"},
      {"name": "Orders", "url": "#"}
    ]
  });
});

// Change avatar
router.post('/change-avatar', async (req, res) => {
  var uid = req.session.user.UID;

  // Use connect-busboy middleware to handle multipart file upload
  console.log("Preparing busboy and filestream.");
  var fstream;  
  req.pipe(req.busboy);
  req.busboy.on('file', (fieldname, file, filename) => {
    console.log("Received file upload, trying to save...");
    // Validate that uploaded file is an image
    var isImg = isImage(filename);
    if (!isImg) {
      res.redirect('?upload=failed');
    } else {
      // Save file to server
      // First, make a directory for this user (if not exist)
      var dir = path.join(__dirname, '../public/images/avatar/', uid);
      fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) {
          console.log("Error while making directory.");
          throw err;
        }
      });

      // Then, write the image to this directory
      var filepath = path.join(dir, filename);
      fstream = fs.createWriteStream(filepath);
      file.pipe(fstream);
      fstream.on('close', async () => {
        console.log("File successfully saved.");
        // Use dynamic path to serve file
        var dynamicpath = path.join('/images/avatar/', uid, filename);
        await db.editUserAvatar(uid, dynamicpath);
        req.session.user.pathToAvatar = dynamicpath;
        console.log("File saved to database.");
        // Redirect user back to user panel
        var url = '?upload=success';
        res.redirect(url);
      });
    }    
  });
});

module.exports = router;