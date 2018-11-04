const Config = require('./../env.js');
const rootAdmin = "Admin";
function getURL(req) {
    return {
        currentUrl: ((process.env.PORT || 123) === 123 ? req.protocol : "https") + '://' + req.get('host'),
        root: rootAdmin,
        originalUrl: req.originalUrl
    };
}

module.exports = function (app, passport , obj) {
    
    app.get('/', (req, res) => {
        var data = {
            assetURL: getURL(req),
            objectServer : obj,
            appTitle : "home page -- "+ Config.app.name,
            appName : Config.app.name,
            appDescription : Config.app.description,
            linkGoogleApp : Config.app.linkGoogleApp,
            linkAppleApp   : Config.app.linkAppleApp
        }
        res.render('Front/index.ejs', data);
    });
    app.get('/sign-up', (req, res) => {
        var data = {
            assetURL: getURL(req),
            objectServer : obj,
            appTitle : "sign up page -- "+ Config.app.name,
            appName : Config.app.name,
            appDescription : Config.app.description,
            linkGoogleApp : Config.app.linkGoogleApp,
            linkAppleApp   : Config.app.linkAppleApp
        }
        res.render('Front/sign-up.ejs', data);
    });

    app.get('/sign-in', (req, res) => {
        var data = {
            assetURL: getURL(req),
            objectServer : obj,
            appTitle : "sign in page -- "+ Config.app.name,
            appName : Config.app.name,
            appDescription : Config.app.description,
            linkGoogleApp : Config.app.linkGoogleApp,
            linkAppleApp   : Config.app.linkAppleApp
        }
        res.render('Front/sign-in.ejs', data);
    });
    app.get('/login', (req, res, next) => {
        if (req.isAuthenticated()) {
            res.redirect('/');
        } else {
            next();
        }
    }, function (req, res) {
        res.render('Front/login.ejs', { assetURL: getURL(req) });
    })
    app.get('/logout', function (req, res) {
        if (req.isAuthenticated()) {
            req.logout();
            return res.redirect('/login');
        } else {
            next();
        }
    })
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));
    var registerPassport = require('./../passport.js');
    var instanceRegisterPassport = new registerPassport(passport);
}
