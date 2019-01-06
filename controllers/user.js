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

// Routing
// User info page and its helper function
var userInfo_sessionChecker = (req, res, next) => {
  console.log("Session: ", req.session.user, "\nCookie: ", req.cookies.s4g_session);
  if (req.session.user && req.cookies.s4g_session) {
    var url;
    switch (getRole(req)) {
      case 'MEMBER':
        url = '/user/';
        url += req.session.user.UID;
        break;
      case 'ADMIN':
        url = '/admin'
        break;
      default:
        // TODO: Handle undefined user role
        break;
    }
    res.redirect(url);
  } else {
    next();
  }
}

router.get('/', userInfo_sessionChecker, (req, res) => {
  res.redirect('/login');
});

router.get('/:uuid', async (req,res) => {
  var role = getRole(req);
  var uploadStatus = req.query.upload || null;
  var currentUID = null;
  if (role != "GUEST") {
    currentUID = req.session.user.UID;
  }
  var pageUID = req.params.uuid;
  var isOwner = currentUID == pageUID ? true : false;
  var owner = await db.findUserWithID(pageUID);
  console.log("Upload status:", uploadStatus);
  res.render('user/index', {
    role: role,
    uploadStatus: uploadStatus,
    uid: pageUID,
    isOwner: isOwner,
    owner: owner,
    page: 'user',
    breadcrumb: [
      {"name": "User", "url": "#"},
      {"name": owner.Username, "url": "#"}
    ]
  });
});

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
      res.redirect('/user/' + uid + '?upload=failed');
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
        var url = '/user/' + uid + '?upload=success';
        res.redirect(url);
      });
    }    
  });
})

// Change password
router.get('/:uuid/change-password', async (req, res) => {
  var status = req.query.status || null;
  var role = getRole(req);
  var currentUID = null;
  if (role != "GUEST") {
    currentUID = req.session.user.UID;
  }
  var pageUID = req.params.uuid;
  if (currentUID != pageUID) {
    res.redirect('/user');
  }
  console.log("/user/:uuid/change-password - pageUID = ", pageUID);
  var owner = await db.findUserWithID(pageUID);
  var isOwner = currentUID == pageUID ? true : false;

  res.render('user/change-password', {
    status: status,
    role: role,
    uid: pageUID,
    isOwner: isOwner,
    owner: owner,
    page: 'user-change-password',
    breadcrumb: [
      {"name": "User", "url": "/user/" + pageUID },
      {"name": owner.Username, "url": "/user/" + pageUID },
      {"name": "Change password", "url": "#" }
    ]
  });
});

router.post('/:uuid/change-password', async (req, res) => {
  var oldPass = req.body.old_pass;
  var newPass = req.body.new_pass;
  var reNewPass = req.body.re_new_pass;
  var uid = req.body.uid;
  /* TODO:
    Check if new pass == re new pass
    If true, call query
    If false, redirect to '/user/' + uid + '/change-password?status=failed'
  */

  if(newPass != reNewPass) res.redirect('/user' + uid + '/change-password?status=failed');

  var result = await db.changePassword(uid,newPass,oldPass);
});

router.post('/:uuid/change-password', async (req, res) => {
  // TODO: Validate input

  // TODO: Execute query to change password

});


module.exports = router;