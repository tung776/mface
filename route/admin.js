const rootAdmin = '/Admin';

module.exports = function (app, passport , obj) {
    // =====================================
    // Trang chủ (có các url login) ========
    // =====================================
    app.get(rootAdmin + '/', function (req, res) {
        if (req.isAuthenticated()) {
            res.render('Admin/index.ejs', { assetURL: getURL(req) });
        } else {
            res.redirect(rootAdmin + '/login');
        }
    });
    app.get(rootAdmin + '/login', function (req, res) {
        res.render('Admin/login.ejs', { assetURL: getURL(req), message: req.flash('loginMessage') });
    })
    app.post(rootAdmin + '/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: rootAdmin + '/login'
    }));
    app.get(rootAdmin + '/sign-up', function (req, res) {
        res.render('Admin/sign-in.ejs', { assetURL: getURL(req) , signupMessage : req.flash('signupMessage') });
    })
    app.post(rootAdmin + '/sign-up', function (req, res) {
        var config = require("./../env.js");
        if(config.passwordSystem != req.body.expecial){
            req.flash("signupMessage", "mày là ai?");
            return res.redirect(rootAdmin + '/sign-up');
        }
        process.nextTick(function () {
            var user = require('./../models/user.js');
            user.findOne({ 'local.username': req.body.username }, function (err, docUser) {
                if (err){
                    req.flash("signupMessage", "có lỗi khi findone");
                    return res.redirect(rootAdmin + '/sign-up');
                }
                if (docUser) {
                    req.flash("signupMessage", "Email  đã tồn tại .");
                    return res.redirect(rootAdmin + '/sign-up');
                } else {
                    var newUser = new user();
                    newUser.local.username = req.body.username;
                    newUser.local.password = newUser.generateHash(req.body.password);
                    newUser.save(function (err) {
                        if (err){
                            throw(err);
                            req.flash("signupMessage", "có lỗi khi lưu.");
                            return res.redirect(rootAdmin + '/sign-up');
                        }
                        req.flash("signupMessage", "thêm tài khoản: "+req.body.username+" thành công ");
                        return res.redirect(rootAdmin + '/login');
                    });
                }
            });
        });
    });
    var registerPassport = require('./../passport.js');
    var instanceRegisterPassport = new registerPassport(passport);
}

function getURL(req) {
    return {
        currentUrl: ((process.env.PORT || 123) === 123?  req.protocol : "https") + '://' + req.get('host'),
        root: rootAdmin,
        originalUrl: req.originalUrl
    };
}

