var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('fb', { title: 'Express' });
});
router.post('/', function(req, res, next) {
  res.render('fb', { title: 'FacebookApp' });
});
module.exports = router;
