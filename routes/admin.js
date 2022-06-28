var express = require('express');
var router = express.Router();

var adminController = require('../controllers/adminController')

function checkSignIn(req, res, next){
  if (req.session.user) {
   next();     //If session exists, proceed to page
  }
  else {
   res.redirect('/admin/admin_login');
   //next(err);  //Error, trying to access unauthorized page!
}
};

/* GET users listing. */

router.get('/', checkSignIn, adminController.blank_get);

router.get('/admin_login', adminController.login_get);

router.post('/admin_login', adminController.login_post);


router.get('/data', checkSignIn, adminController.data_get);

router.get('/admin_logout', checkSignIn, adminController.logout_get);

module.exports = router; 
