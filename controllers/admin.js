// Import dependencies
var express = require('express');
var session = require('express-session');
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
var admin_sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.s4g_session && req.session.user.Role == "ADMIN") {
    res.render('admin/index', {
      role: getRole(req),
      page: 'admin',
      breadcrumb: [{"name": "Cart", "url": "#"}]
    });
  } else {
    next();
  }
}

router.get('/', admin_sessionChecker, (req, res) => {
  res.redirect('/');
});

module.exports = router;