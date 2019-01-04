// Import dependencies
var express = require('express');
var session = require('express-session');
var fs = require('fs');
var path = require('path');
var isImage = require('is-image');
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
// User info page and its helper function
var userInfo_sessionChecker = (req, res, next) => {
  console.log("Session: ", req.session.user, "\nCookie: ", req.cookies.s4g_session);
  if (req.session.user && req.cookies.s4g_session) {
    var url;
    switch (req.session.user.Role) {
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
  var uploadStatus = req.query.upload || null;
  var currentUID = req.session.user.UID || null;
  var pageUID = req.params.uuid;
  var isOwner = currentUID == pageUID ? true : false;
  var owner = await db.findUserWithID(pageUID); // TODO: !IMPORTANT: not expected behaviour
  //TODO: = replace that ^ with findUserWithID(pageUID)*/
  console.log("/controllers/user.js: GET: /:uuid - owner = ",owner);
  console.log("Upload status:", uploadStatus);
  res.render('user/index', {
    role: getRole(req),
    uploadStatus: uploadStatus,
    uid: pageUID,
    isOwner: isOwner,
    owner: owner,
    page: 'user',
    breadcrumb: [{"name": "User info", "url": "#"}]
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
      fstream.on('close', () => {
        console.log("File successfully saved.");
        // TODO: update USER to reflect the avatar change
        // USER.pathToAvatar = filepath

        // Redirect user back to user panel
        var url = '/user/' + uid + '?upload=success';
        res.redirect(url);
      });
    }    
  });
})

module.exports = router;