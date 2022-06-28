var mongoose = require('mongoose');
var Order = require('../models/order.js');
var User = require('../models/user');
var bcrypt = require("bcrypt");


exports.blank_get = (req, res) => {
        res.redirect('/admin/data')
}
exports.login_get = (req, res) => {
    res.render('admin_login', {title: "Admin Login"})
}

exports.login_post = async (req, res) => {
    //confirm details in database
    var user = await User.findOne({email: req.body.email});
    if (!user.admin) {
        res.render('login', {title: 'Login', msg: ["You do not have permission to view this page"]});
        return
    }
    if (user) {
        const validpass = await bcrypt.compare(req.body.password, user.password);
        if (validpass) {
            req.session.user = user;
            res.redirect('/admin/data')
        }
    }
    else {
        res.render('login', {title: 'Login', msg: 'Invalid email or password'})
    }
}


exports.data_get = (req, res) => {
    //get all orders from database
    Order.find()
    .populate(['user', 'items'])
    .sort({'user.first_name': 'ascending'})
    .exec( function (err, orders) {
        if (err) { return next(err);}

        res.render('data', {title: "Customer's Orders", orders: orders})
    })
    
}

exports.logout_get = (req, res) => {    
    ///get all user orders cart info from customer
    req.session.destroy();
    res.redirect('/admin/admin_login')
}
