var express = require('express');
var router = express.Router();
var index_controller = require('../controllers/indexController');

function checkSignIn(req, res, next){
    if (req.session.user) {
     next();     //If session exists, proceed to page
    }
    else {
     res.redirect('/login', 200, {title: 'Log in', msg : ["Not logged in!"]});
     next(err);  //Error, trying to access unauthorized page!
  }
};


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', index_controller.login_get);

router.post('/login', index_controller.login_post);


router.get('/signup', index_controller.signup_get);

router.post('/signup', index_controller.signup_post);


router.get('/forgot_password', index_controller.forgot_password_get);

router.post('/forgot_password', index_controller.forgot_password_post);


router.get('/reset_password/:id', index_controller.reset_password_get);

router.post('/reset_password/:id', index_controller.reset_password_post);


router.get('/email_OTP', index_controller.email_OTP_get);

router.post('/email_OTP', index_controller.email_OTP_post);

router.get('/homepage', checkSignIn, index_controller.homepage_get);
router.get('/homepage/:id', checkSignIn, index_controller.homepage_post);


router.get('/cart', checkSignIn, index_controller.cart_get);

router.post('/cart', checkSignIn, index_controller.cart_post);


router.get('/payment_success', checkSignIn, index_controller.payment_success_get);

router.get('/orders', checkSignIn, index_controller.orders_get);

router.get('/logout', checkSignIn, index_controller.logout_get);

module.exports = router;
