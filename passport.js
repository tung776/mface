function _registerPassport(passport) {
    var flash = require("connect-flash");

    var LocalStrategy = require('passport-local').Strategy;
    passport.use('local-login', new LocalStrategy({
        passReqToCallback: true
    },
        function (req, username, password, done) {
            var user = require('./models/user.js');
            user.findOne({ "local.username": username }).exec(function (err, data) {
                if (err)
                    return done(err);
                if (!data) {
                    return done(null, false, req.flash('loginMessage', 'không thấy user.'));
                }
                // if the user is found but the password is wrong
                if (!data.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'password sai'));
                return done(null, data._id);
            });
        }
    ));
}

module.exports = class registerPassport{
    constructor(passport){
        _registerPassport(passport);
    }
}