var mongoose = require('mongoose')

var Schema = mongoose.Schema;

var UserSchema = new Schema (
    {
        first_name: {type: String, required: true, maxlength: 100},
        last_name: {type: String, required: true, maxlength: 100},
        email: {type: String, required: true, unique: true, maxlength: 100},
        password: {type: String, required: true},
        verified: {type: Boolean, default: false},
        admin: {type: Boolean, default: false},
        OTP: Number,
        reset_link: {type: String}

    }

);

UserSchema.virtual('name').get( function () {
    return this.first_name + ' ' + this.last_name
});

module.exports = mongoose.model('User', UserSchema);