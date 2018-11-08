const Config = require('./../env.js');
const rootAdmin = "Admin";
function getURL(req) {
    return {
        currentUrl: ((process.env.PORT || 123) === 123 ? req.protocol : "https") + '://' + req.get('host'),
        root: rootAdmin,
        originalUrl: req.originalUrl,
        username: typeof (req.user) == 'undefined' ? null : req.user,
    };
}

module.exports = function (app, passport, obj) {
    const numbermemberajax = 400;
    const stringScriptSelFirst = `
    document.getElementById("groupsMemberSection_recently_joined").getElementsByClassName("stat_elem")[0].className = document.getElementById("groupsMemberSection_recently_joined").getElementsByClassName("stat_elem")[0].className.replace("mam", "").replace("uiMorePager", "").replace("stat_elem", "").replace("morePager", "") + " mface_action_remove";
    document.getElementById("groupsMemberSection_recently_joined").getElementsByClassName("uiMorePagerPrimary")[document.getElementById("groupsMemberSection_recently_joined").getElementsByClassName("uiMorePagerPrimary").length - 1].href = document.getElementById("groupsMemberSection_recently_joined").getElementsByClassName("uiMorePagerPrimary")[document.getElementById("groupsMemberSection_recently_joined").getElementsByClassName("uiMorePagerPrimary").length - 1].href.replace('limit=15&', 'limit=400&');
    document.getElementsByClassName("mface_action_remove")[0].scrollIntoView();
    console.clear();
    `;
    const stringScriptSelSecond = `
        console.clear();
        document.getElementsByClassName("mface_action_remove")[0].remove();  
        var list_stat_elem = document.getElementById("groupsMemberSection_recently_joined").getElementsByClassName("stat_elem");
        var stat_elem = list_stat_elem[list_stat_elem.length - 1]
        var classReplace = stat_elem.className.replace("mam", "").replace("uiMorePager", "").replace("stat_elem", "").replace("morePager", "");
        stat_elem.className = classReplace + " mface_action_remove";
        var tagAMore = document.getElementById("groupsMemberSection_recently_joined").getElementsByClassName("uiMorePagerPrimary")[0];
        tagAMore.href = tagAMore.href.replace('limit=15&', 'limit=400&');
        var scrollwindowmface =  window.scrollTo(0,document.body.scrollHeight);

        tagAMore.click();
    `;
    const stringScriptSelenium = `
    var xemthem = document.getElementById("groupsMemberSection_recently_joined").getElementsByClassName("stat_elem")[0].getElementsByTagName('a')[0];
	xemthem.href = xemthem.href.replace('&limit=15&', '&limit=`+ numbermemberajax + `&');
	console.log(xemthem.href);
	xemthem.click();
    `;
    app.get('/', (req, res) => {

        var data = {
            assetURL: getURL(req),
            objectServer: obj,
            appTitle: "home page -- " + Config.app.name,
            appName: Config.app.name,
            appDescription: Config.app.description,
            linkGoogleApp: Config.app.linkGoogleApp,
            linkAppleApp: Config.app.linkAppleApp,
            dataUser: typeof (req.user) == 'undefined' ? null : req.user,
        }
        res.render('Front/index.ejs', data);
    });
    app.get('/sign-up', (req, res) => {
        var data = {
            assetURL: getURL(req),
            objectServer: obj,
            appTitle: "sign up page -- " + Config.app.name,
            appName: Config.app.name,
            appDescription: Config.app.description,
            linkGoogleApp: Config.app.linkGoogleApp,
            linkAppleApp: Config.app.linkAppleApp,
            message: req.flash('signupMessage')
        }
        res.render('Front/sign-up.ejs', data);
    });

    app.get('/sign-in', (req, res, next) => {
        if (req.isAuthenticated()) {
            res.redirect('/');
        } else {
            next();
        }
    }, (req, res) => {
        var data = {
            assetURL: getURL(req),
            objectServer: obj,
            appTitle: "sign in page -- " + Config.app.name,
            appName: Config.app.name,
            appDescription: Config.app.description,
            linkGoogleApp: Config.app.linkGoogleApp,
            linkAppleApp: Config.app.linkAppleApp,
            messageUP: req.flash('signupMessage'),
            messageIN: req.flash('loginMessage'),
        }
        res.render('Front/sign-in.ejs', data);
    });
    var LocalStrategy = require('passport-local').Strategy;
    passport.use('local-login', new LocalStrategy(
        {
            passReqToCallback: true,
            usernameField: 'email',
            passwordField: 'password'
        },
        function (req, email, password, done) {

            var user = require('./../models/user.js');
            user.findOne({ "email": email }).exec(function (err, data) {
                if (err)
                    return done(err);
                if (!data) {
                    return done(null, false, req.flash('loginMessage', 'không thấy user!'));
                }
                // if the user is found but the password is wrong
                if (!data.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'password sai!'));
                return done(null, data._id);
            });
        }
    ));
    app.post('/sign-in', passport.authenticate('local-login', {
        successRedirect: '/service',
        failureRedirect: '/sign-in'
    }));

    app.post('/sign-up', (req, res) => {
        process.nextTick(function () {
            var email = req.body.email;
            var password = req.body.password;
            var sdt = req.body.sdt;
            ///validate 
            if (("h" + email).indexOf('@') == -1 || email.length < 6) {
                req.flash("signupMessage", "email sai, u is hacker?");
                return res.redirect('/sign-up');
            }
            if (password.length < 6) {
                req.flash("signupMessage", "password sai, u is hacker?");
                return res.redirect('/sign-up');
            }
            if (sdt.length < 6) {
                req.flash("signupMessage", "sdt sai, u is hacker?");
                return res.redirect('/sign-up');
            }

            var user = require('./../models/user.js');
            user.findOne({ 'sdt': req.body.sdt }, function (err, docUser) {
                if (docUser) {
                    req.flash("signupMessage", "sdt  đã tồn tại .");
                    return res.redirect('/sign-up');
                }
            });
            user.findOne({ 'email': req.body.email }, function (err, docUser) {
                if (err) {
                    req.flash("signupMessage", "có lỗi khi findone sign up");
                    return res.redirect('/sign-up');
                }
                if (docUser) {
                    req.flash("signupMessage", "Email  đã tồn tại .");
                    return res.redirect('/sign-up');
                } else {
                    var newUser = new user();
                    newUser.email = req.body.email;
                    newUser.password = newUser.generateHash(req.body.password);
                    newUser.quyen = 'FreeUser';
                    newUser.sdt = req.body.sdt;
                    newUser.save().then(dataU => {
                        console.log(dataU);
                        req.flash("signupMessage", "thêm tài khoản: " + dataU.email + " thành công ");
                        return res.redirect('/sign-in');
                    }).catch(err => {
                        req.flash("signupMessage", "có lỗi khi lưu." + err);
                        return res.redirect('/sign-up');
                    });
                }
            });
        });
    });
    app.get('/sign-out', function (req, res) {
        if (req.isAuthenticated()) {
            req.logout();
        }
        return res.redirect('/sign-in');
    })
    app.get('/service', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.redirect('/sign-in');
        } else {
            next();
        }
    }, function (req, res) {
        var data = {
            assetURL: getURL(req),
            objectServer: obj,
            appTitle: "home page -- " + Config.app.name,
            appName: Config.app.name,
            appDescription: Config.app.description,
            linkGoogleApp: Config.app.linkGoogleApp,
            linkAppleApp: Config.app.linkAppleApp,
            dataUser: typeof (req.user) == 'undefined' ? null : req.user,
        }
        return res.render('Front/service.ejs', data);
    });
    app.get('/running', (req, res, next) => {
        if (!req.isAuthenticated()) {
            res.redirect('/sign-in');
        } else {
            next();
        }
    }, function (req, res) {
        var data = {
            assetURL: getURL(req),
            objectServer: obj,
            appTitle: "home page -- " + Config.app.name,
            appName: Config.app.name,
            appDescription: Config.app.description,
            linkGoogleApp: Config.app.linkGoogleApp,
            linkAppleApp: Config.app.linkAppleApp,
            dataUser: typeof (req.user) == 'undefined' ? null : req.user,
        }
        res.render('Front/running.ejs', data);
    });
    app.get("/selenium", function (req, res) {
        var webdriver = require('selenium-webdriver');
        var By = webdriver.By;
        var driver = new webdriver.Builder()
            .forBrowser('phantomjs')
            .build();
        // driver.get('http://www.google.com/ncr');
        // driver.findElement(By.name('q')).sendKeys('webdriver');
        // driver.findElement(By.name('btnG')).click();
        // driver.wait(function () {
        //     return driver.getTitle().then(function (title) {
        //         console.log(title);
        //         return title === 'webdriver - Google Search';
        //     });
        // }, 5000).then(function () {
        //     res.status(200).send('Done');
        // }, function (error) {
        //     res.status(200).send(error);
        // });
        // driver.quit();
        var username = '';
        var password = '';
        var linkgroup = 'https://www.facebook.com/groups/TOEICTNTRAM/members/';
        var messageClient = 'req.body.message';
        if (!username.trim()) { username = 'jbtruongthanhhung@gmail.com'; password = 'hungtt@266' }
        console.log(username);
        console.log(password);
        console.log(linkgroup);
        console.log(messageClient);
        //const webdriver = require('selenium-webdriver');
        (async function () {
            try {
                await driver.get('http://www.facebook.com')
                var email = await driver.findElement(webdriver.By.name('email'));
                var pass = await driver.findElement(webdriver.By.name('pass'));
                await email.sendKeys(username)
                await pass.sendKeys(password)
                await pass.submit();//https://www.facebook.com/groups/TOEICTNTRAM/members/
                await driver.get(linkgroup)
                var title = await driver.getTitle()
                console.log('Page title is: ' + title);
                // # . > div.clearfix mam uiMorePager stat_elem morePager > a.pam uiBoxLightblue.uiMorePagerPrimary
                // continues : facebook create : div.fbProfileBrowserList > div.clearfix.mam.uiMorePager.stat_elem.morePager
                // chuyển kiểu của đối tượng driver thành JavascriptExecutor
                //JavascriptExecutor js = (JavascriptExecutor) driver;
                // sử dụng các methods
                //js.executeScript(stringScriptSelenium);  WebDriver executeAsyncScript
                try {
                    var numbersMember = await driver.findElement(webdriver.By.id('groupsMemberBrowser')).findElement(webdriver.By.className('_grm')).findElement(webdriver.By.tagName('span')).getText();
                    console.log(numbersMember);
                    var numberIndexFor = Math.ceil((numbersMember - 15.0) / numbermemberajax);
                    for (var i = 0; i < numberIndexFor; i++) {
                        await driver.executeAsyncScript(stringScriptSelenium).then(() => { }, err => {
                            console.log("lỗi trong exc : " + i + " / " + err);
                        });
                    }
                    await driver.findElement(webdriver.By.id('groupsMemberSection_recently_joined')).getAttribute("innerHTML").then(function (profile) {
                        const cheerio = require('cherio')
                        const $ = cheerio.load(profile)
                        var data_id_user = [];
                        $('._gse[data-name=GroupProfileGridItem]').each(function (i, elem) {
                            // Range Name
                            console.log("iteration - ", i);
                            console.log("name - ", $(this).attr('id'));
                            data_id_user.push($(this).attr('id'));
                        });
                        //console.log(data_id_user);
                    });
                    await driver.quit();
                } catch (e) {
                    console.log("err catch" + e);
                    await driver.quit();
                }
            } catch (e) {
                console.log('lỗi : ', e);
            }
        })()
    });
    app.post("/run-service", (req, res, next) => {
        if (!req.isAuthenticated()) {
            res.redirect('/sign-in');
        } else {
            next();
        }
    }, function (req, res) {

        res.redirect('/running');
        var username = req.body.username;
        var password = req.body.password;
        var linkgroup = req.body.linkgroup;
        var messageClient = req.body.message;
        if (!username.trim()) { username = 'jbtruongthanhhung@gmail.com'; password = 'hungtt@266' }
        console.log(username);
        console.log(password);
        console.log(linkgroup);
        console.log(messageClient);
        //const webdriver = require('selenium-webdriver');
        var webdriver = require('selenium-webdriver');
        var By = webdriver.By;
        (async function () {
            try {
                var chromeCapabilities = webdriver.Capabilities.chrome()
                var chromeOptions = {
                    'args': ['--disable-infobars', "--disable-notifications"]
                };
                chromeCapabilities.set('chromeOptions', chromeOptions);
                var driver1 = new webdriver.Builder().forBrowser('chrome').withCapabilities(chromeCapabilities).build();
                var driver = new webdriver
                    .Builder()
                    .withCapabilities(capability)
                    .build();
                await driver.get('http://www.facebook.com')



                var email = await driver.findElement(webdriver.By.name('email'));
                var pass = await driver.findElement(webdriver.By.name('pass'));
                await email.sendKeys(username)
                await pass.sendKeys(password)
                await pass.submit();//https://www.facebook.com/groups/TOEICTNTRAM/members/
                await driver.get(linkgroup)
                var title = await driver.getTitle()
                console.log('Page title is: ' + title);
                // # . > div.clearfix mam uiMorePager stat_elem morePager > a.pam uiBoxLightblue.uiMorePagerPrimary
                // continues : facebook create : div.fbProfileBrowserList > div.clearfix.mam.uiMorePager.stat_elem.morePager
                // chuyển kiểu của đối tượng driver thành JavascriptExecutor
                //JavascriptExecutor js = (JavascriptExecutor) driver;
                // sử dụng các methods
                //js.executeScript(stringScriptSelenium);  WebDriver executeAsyncScript
                try {
                    var numbersMember = await driver.findElement(webdriver.By.id('groupsMemberBrowser')).findElement(webdriver.By.className('_grm')).findElement(webdriver.By.tagName('span')).getText();
                    console.log(numbersMember);
                    var numberIndexFor = Math.ceil((numbersMember - 15.0) / numbermemberajax);
                    for (var i = 0; i < numberIndexFor; i++) {
                        await driver.executeAsyncScript(stringScriptSelenium).then(() => { }, err => {
                            console.log("lỗi trong exc : " + i + " / " + err);
                        });
                    }
                    await driver.findElement(webdriver.By.id('groupsMemberSection_recently_joined')).getAttribute("innerHTML").then(function (profile) {
                        const cheerio = require('cherio')
                        const $ = cheerio.load(profile)
                        var data_id_user = [];
                        $('._gse[data-name=GroupProfileGridItem]').each(function (i, elem) {
                            // Range Name
                            console.log("iteration - ", i);
                            console.log("name - ", $(this).attr('id'));
                            data_id_user.push($(this).attr('id'));
                        });
                        //console.log(data_id_user);
                    });
                    await driver.quit();
                } catch (e) {
                    console.log("err catch" + e);
                    await driver.quit();
                }
            } catch (e) {
                console.log('lỗi : ', e);
            }
        })()
    });
    app.get('/phantom', (req, res) => {
        var phantom = require('phantom');
        var _ph, _page, _outObj;

        phantom.create().then(ph => {
            _ph = ph;
            return _ph.createPage();
        }).then(page => {
            _page = page;
            return _page.open('https://stackoverflow.com/');
        }).then(status => {
            console.log(status);
            var content = _page.property('content');
            return content;
        }).then(content => {
            console.log(content);
            res.send(content);
            _page.close();
            _ph.exit();
        })
            .catch(e => console.log(e));
    });
}


// var phantomCapabilities = webdriver.Capabilities.phantomjs();
// var phantomOptions = {
//     'args': ['--disable-infobars', "--disable-notifications"]
// };
// var driver1 = new webdriver.Builder().forBrowser('chrome').withCapabilities(chromeCapabilities).build();
// phantomCapabilities.set('phantomjs.cli.args', '--ignore-ssl-errors=true');

// ///////////////////////////////////////////////////
// var webdriver = require('selenium-webdriver');var phantomjs = require('phantomjs');var driver = new webdriver.Builder().withCapabilities({"phantomjs.binary.path":phantomjs.path}).forBrowser('phantomjs').build();
// /////////////////////////////////////////////////////
// var webdriver = require('selenium-webdriver');var driver2 = new webdriver.Builder().withCapabilities(webdriver.Capabilities.phantomjs().set("phantomjs.page.settings.userAgent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36")).build();
// //////////////////////////////////////////
