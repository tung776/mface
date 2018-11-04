// config/passport.js
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
        console.log("serializeUser")
    });

    passport.deserializeUser(function (id, done) {
        console.log("before deserializeUser");
        User.findById(id, function (err, user) {
            done(err, user);
        });
        console.log("affter deserializeUser");
    });

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        }, function (req, email, password, done) { // callback with email and password from our form
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            console.log("local-login");
            return done(null, {name:"hung"});

        }
    ));
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, email, password, done) {
            process.nextTick(function () {
                User.findOne({ 'local.email': email }, function (err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'Email  đã tồn tại .'));
                    } else {
                        var newUser = new User();
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
    
                });
    
            });
    
        }
    ));
};


