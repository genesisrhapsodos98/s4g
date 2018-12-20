var express = require('express');
var router = express.Router();

router.use(express.static(__dirname + '../public'));

router.get('/cat1', function(req, res) {
  res.render('category/cat1');
})

router.get('/cat2', function(req, res) {
  res.render('category/cat2');
})

router.get('/cat3', function(req, res) {
  res.render('category/cat3');
})

router.get('/cat4', function(req, res) {
  res.render('category/cat4');
})

router.get('/cat5', function(req, res) {
  res.render('category/cat5');
})

module.exports = router;