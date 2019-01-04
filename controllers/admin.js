// Import dependencies
var express = require('express');
var session = require('express-session');
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
    user: req.session.user,
    role: getRole(req),
    page: 'admin',
    breadcrumb: [{"name": "Admin", "url": "#"}]
  });
});

router.get('/change-avatar', (req, res) => {
  res.render('admin/change-avatar', {
    user: req.session.user,
    role: getRole(req),
    page: 'admin',
    breadcrumb: [
      {"name": "Admin", "url": "/admin"},
      {"name": "Change avatar", "url": "#"}
    ]
  });
})

module.exports = router;