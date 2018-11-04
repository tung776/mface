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
    app.get('/ajax/data_user', (req, res) => {
        var ranpic1 = Math.floor((Math.random() * 1000) + 1);
        var ranpic2 = Math.floor((Math.random() * 1001) + 1);
        var ranpic3 = Math.floor((Math.random() * 1002) + 1);
        var ranpic4 = Math.floor((Math.random() * 1003) + 1);
        var dataAjax = [
            {
                link: '#',
                srcImages: 'https://picsum.photos/' + ranpic1 + '/' + Math.floor(220 * ranpic1 / 160) + '/?random',
                altImages: '',
                inforName: 'Trí Lục Siêu Phàm 1',
                inforDes: 'Lorem ipsum dolor sit amet.',
                inforPrice: '100.000'
            },
            {
                link: '#',
                srcImages: 'https://picsum.photos/' + ranpic2 + '/' + Math.floor(220 * ranpic2 / 160) + '/?random',
                altImages: '',
                inforName: 'Trí Lục Siêu Phàm 2',
                inforDes: 'Lorem ipsum dolor sit amet.',
                inforPrice: '200.000'
            },
            {
                link: '#',
                srcImages: 'https://picsum.photos/' + ranpic3 + '/' + Math.floor(220 * ranpic3 / 160) + '?random',
                altImages: '',
                inforName: 'Trí Lục Siêu Phàm 3',
                inforDes: 'Lorem ipsum dolor sit amet.',
                inforPrice: '200.000'
            },
            {
                link: '#',
                srcImages: 'https://picsum.photos/' + ranpic4 + '/' + Math.floor(220 * ranpic4 / 160) + '?random',
                altImages: '',
                inforName: 'Trí Lục Siêu Phàm 4',
                inforDes: 'Lorem ipsum dolor sit amet.',
                inforPrice: '300.000'
            }
        ]
        res.json(dataAjax);
    });

    app.get('/san-pham', (req, res, next) => {
        if (!req.isAuthenticated()) {
            res.redirect('/login');
        } else {
            next();
        }
    }, (req, res) => {
        var data = {
            assetURL: getURL(req),
            username: req.user.username
        }
        res.render('Front/san-pham.ejs', data);
    });
    app.get('/testname',(req, res) => {
        var data = {
            assetURL: getURL(req),
            username: 12345
        }
        res.render('Front/about.ejs', data);
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
