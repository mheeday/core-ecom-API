var bcrypt = require("bcrypt");
var async = require("async");
var crypto = require('crypto');
var User = require("../models/user");
var Cart = require("../models/cart");
var Item = require('../models/item');
var Order = require('../models/order.js')
var mongoose = require('mongoose');

//import Model too
const { body, validationResult } = require('express-validator');
const user = require("../models/user");
const { link } = require("fs");

function get_errors (err_array) {
    let err = [];
    for (let i = 0; i < err_array.length; i++) {
        err[i] = err_array[i].msg;
    }
    return err;
}

function generateOTP() {
    var minm = 100000;
    var maxm = 999999;
    return Math.floor(Math
    .random() * (maxm - minm + 1)) + minm;
}

exports.login_get = function (req, res) {
    if (req.session.user) {
        res.redirect('/homepage')
    }
    else {
        res.render('login', {title: "Login"});
    }
};

exports.login_post = async (req, res) => {
    var user = await User.findOne({email: req.body.email});
    console.log(1);
    if (user) {
        const validpass = await bcrypt.compare(req.body.password, user.password);
        console.log(2);
        console.log(validpass);
        if (validpass) {
            req.session.user = user;
            console.log(3);
            res.redirect('/homepage')
        }
    }
        res.render('login', {title: 'Login', msg: ['Invalid email or password']})
}

exports.signup_get = (req, res) => {
    if (req.session.user) {
        res.redirect('/homepage')
        return;
    }
    res.render('signup', {title: 'Sign Up'})
}

exports.signup_post = [

    body('first_name').trim().escape().isLength({ min: 1 }).withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    
    body('last_name').trim().escape().isLength({ min: 1 }).withMessage('Last name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),

    body('password').trim().escape().isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),

     (req, res, next) => {
        const errors = validationResult(req);
        console.log(1)

        if (!errors.isEmpty()) {
            let msg = get_errors(errors.array());
            res.render('signup', {title: 'Sign Up', msg: msg});
            console.log(errors.array(msg));
            console.log(2);
            delete msg;
            return;
        }
        else {
            User.findOne({'email': req.body.email})
            .exec( function(err, found_user ) {
                if (err) { return next(err)}

                if (found_user) {
                    //Genre exist
                    res.render('signup', {title: 'Sign Up', msg: ['User Exists']});
                }

                else {
                    const salt = bcrypt.genSaltSync(10);
                    var new_user = new User (
                        {
                            first_name : req.body.first_name,
                            last_name : req.body.last_name,
                            email : req.body.email,
                            password  : bcrypt.hashSync(req.body.password, salt),
                        }
                    );

                    new_user.save(function (err) {
                        if (err) { return next(err)}
                        req.session.user = new_user;
                        res.redirect('/email_OTP');
                    });
                }
            });           
            
        }
    }
]

exports.reset_password_get = (req, res) => {
    var uuid = req.params.id;

    User.findOne({'reset_link': uuid})
    .exec( function (err, user) {
        if (err) { next(err)}

        if (user) {
            req.anon = user;
            res.render('reset_password', {title: 'Reset Password'});
        }
        else { 
        res.redirect('/forgot_password')
    }
    })
}

exports.reset_password_post = [

    body('password1').trim().escape().isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            let msg = get_errors(errors.array());
            res.render('reset_password', {title: 'Reset Password', msg: msg});
            delete msg;
            return;
        }

        else if (req.body.password1 != req.body.password2) {
            res.render('reset_password', {title: 'Reset Password', msg: ['Passwords dont match']});
            return
        }
        else {
            const salt = bcrypt.genSaltSync(10);
            User.findOne({'reset_link': req.params.id})
            .exec (function (err, user) {
                if (err) { return next(err)}

                if (user) {
                    user.password = bcrypt.hashSync(req.body.password1, salt);
                    user.reset_link = crypto.randomBytes(20).toString('hex');;
                    user.save(function (err) {
                        if (err) { return next(err)}
                        res.redirect('/login');
                    });
                }
            })
        }
    }
]

exports.forgot_password_get = (req, res) => {
    res.render('forgot_password', {title: 'Forgot Password'})
}

exports.forgot_password_post = (req, res) => {
    //check if form email exist in database
    User.findOne({'email': req.body.email})
    .exec( function (err, user) {
        if (err) {return next(err);}
        if (user) {
            let uuid = crypto.randomBytes(20).toString('hex');
            user.reset_link = uuid;
            user.save( function (err) {
                if (err) { next(err)}
                uuid_link = `/reset_password/${uuid}`
                res.render('forgot_password', {title: 'Forgot Password', uuid: uuid_link})
                return
            })
        }
        else{
        res.redirect('/signup')
    }
    })
}

exports.email_OTP_get = (req, res) => {
    console.log(req);
    User.findOne({'email': req.session.user.email})
    .exec( function (err, user ) {
        if (err) {res.redirect('signup');}
        else {
            if (user.verified) { res.redirect('/homepage'); return;}
            let OTP = generateOTP();
            user.OTP = OTP;
            user.save(function (err) {
                if (err) { return next(err)}
                let msg = [`Your unique verification code is ${OTP}`];
                res.render('email_OTP', {title: 'Email Confirmation OTP', msg : msg})
            });
        }
    })
}

exports.email_OTP_post = (req, res) => {
    User.findOne({'email': req.session.user.email})
    .exec( function (err, user ) {
        if (err) {res.redirect('signup');}
        else {
            if (user.verified) { res.redirect('/homepage'); return;}
            if (user.OTP == req.body.otp) {
                user.verified = true;
                user.OTP = generateOTP();
                user.save(function (err) {
                    if (err) { return next(err)}
                    res.redirect('/homepage')
                });
            }
            else {
                res.render('email_OTP', {title: 'Email Confirmation OTP', msg : ['Invalid Code']});
            }
        }
    })
}

exports.homepage_get = (req, res, next) => {
    Item.find()
    .sort({'name': 'ascending'})
    .exec( function (err, items) {
        if (err) { return next(err);}
        else {
            res.render('homepage', {title: 'Home Page', items: items})
        }
    })
}

exports.homepage_post = (req, res, next) => {
    var item_id = mongoose.Types.ObjectId(req.params.id);
    var user = req.session.user;

    async.parallel({
        item: function (callback) {
            Item.findById(item_id)
            .exec(callback)
        },

        cart: function (callback) {
            Cart.findOne({'user': user})
            .exec(callback)
        }

    }, function (err, result) {
        if (err) { next (err);}

        var item = result.item
        var cart = result.cart

        if (!cart) {
            cart = new Cart (
                {user: user}
            )
        }
        cart_length = cart.items.length;
        cart.items[cart_length] = item;
        cart.save(function (err) {
            if (err) { return next(err)}
            res.redirect('/homepage');
        });
    })
}

exports.cart_get = (req, res, next) => {
    // Get cart info from customer
    //
    Cart.findOne({'user': req.session.user})
        .populate('items')
        .exec( function (err, cart) {
            if (err) {return next(err);}
            res.render('cart', {title: 'Cart', cart: cart})
            }
        );
}

exports.cart_post = (req, res) => {
    // check for empty cart
    Cart.findOne({'user': req.session.user})
    .exec( function (err, cart) {
        if (err) {return next(err);}

        if (cart) {
            var new_order = new Order (
                {
                    user: cart.user,
                    items: cart.items
                }
            );
            new_order.save(function (err) {
                if (err) { return next(err)}
                cart.delete();
                res.redirect('/payment_success')
            });
        }
        else {
            res.render('cart', {title: 'Cart', cart: cart.items, msg: ['Empty Cart']})
        }
        }
    );
    
}

exports.payment_success_get = (req, res) => {
    ///get cart info from customer
    res.render('payment_success', {title: 'Payment Sucessful'})
}

exports.orders_get = (req, res) => {
    ///get cart info from customer
    Order.find({'user': req.session.user})
    .populate('items')
    .sort({'date_ordered': 'ascending'})
    .exec (function (err, orders) {
        if (err) { return next(err);}
        res.render('orders', {title: 'Orders', orders: orders})
    })
}

exports.logout_get = (req, res) => {    
    ///get all user orders cart info from customer
    req.session.destroy();
    res.redirect('/login')
}