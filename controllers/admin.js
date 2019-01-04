// Import dependencies
var express = require('express');
var session = require('express-session');
var fs = require('fs');
var path = require('path');
var isImage = require('is-image');
var router = express.Router();

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
})

router.get('/change-password', (req, res) => {
  res.render('admin/change-password', {
    owner: req.session.user,
    role: getRole(req),
    page: 'admin-change-password',
    tab: 'dashboard',
    breadcrumb: [
      {"name": "Admin", "url": "/admin"},
      {"name": "Change password", "url": "#"}
    ]
  });
})

router.get('/products', (req, res) => {
  res.render('admin/products', {
    owner: req.session.user,
    role: getRole(req),
    page: 'admin-products',
    tab: 'ecommerce',
    breadcrumb: [
      {"name": "Admin", "url": "/admin"},
      {"name": "Products", "url": "#"}
    ]
  });
})

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
})

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
})

module.exports = router;