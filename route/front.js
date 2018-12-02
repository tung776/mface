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

    const stringScriptSelenium = `
    try{
        var xemthem = document.getElementById("groupsMemberSection_recently_joined").getElementsByClassName("stat_elem")[0].getElementsByTagName('a')[0];
        xemthem.href = xemthem.href.replace('&limit=15&', '&limit=`+ numbermemberajax + `&');
        console.log(xemthem.href);
        xemthem.click();
        window.setTimeout(arguments[arguments.length - 1], 8000);
    }catch(e){
        console.log("có lỗi trình duyệt");
        window.setTimeout(arguments[arguments.length - 1], 8000);
    }finally{
        window.setTimeout(arguments[arguments.length - 1], 8000);
    }
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
    app.get('/sending', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.redirect('/sign-in');
        } else {
            next();
        }
    }, (req, res) => {
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
        return res.render('Front/sent-message.ejs', data);
    });



    app.post('/sent-messager', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.redirect('/sign-in');
        } else {
            next();
        }
    }, (req, res) => {
        ///////////////////////////////////////////////
        var userEmitSocket = (typeof (req.user) == 'undefined' ? null : req.user);
        ///////////////////////////////////////////////
        res.redirect('/sending');
        const login = require("facebook-chat-api");
        // Create simple echo bot
        login({ email: req.body.username, password: req.body.password }, (err, api) => {
            if (err) {
                obj.socket_data.sockets.emit(
                    'percent_sent_complete',
                    {
                        user_get: userEmitSocket,
                        type: "error",
                        data: {
                            dataLoadMessagePercent: 100,
                            error: true
                        }
                    }
                );
                return console.error(err);
            }
            obj.socket_data.sockets.emit('percent_sent_complete',
                {
                    user_get: userEmitSocket,
                    type: "loadPercent",
                    data: {
                        dataLoadMessagePercent: 2,
                        error: false
                    }
                }
            );
            var arrUserString = req.body.dataUserFacebook;
            var arrUserObj = [];
            console.log(" số lượng phần tử : "+arrUserString.length+ " giả sử đúng");
            for(var i = 0 ; i < arrUserString.length ; i ++){
                var dataUser = JSON.parse(arrUserString[i]);
                arrUserObj = arrUserObj.concat(dataUser)
            }
            /////
            console.log("giả sử nối không lỗi");
            console.log(arrUserObj);
            var variableForDataUser = arrUserObj.length;
            //cứ 2s lôi db ra mà chạy
            var indexCodeTimeout = 10;
            function myFunction() {
                console.log('begin run send message at ' + indexCodeTimeout);
                api.sendMessage(req.body.message, arrUserObj[variableForDataUser - indexCodeTimeout], (err) => {
                    console.log("send done : ");
                    console.log(err);
                    obj.socket_data.sockets.emit(
                        'percent_sent_complete',
                        {
                            user_get: userEmitSocket,
                            type: "error",
                            data: {
                                dataLoadMessagePercent: 100,
                                error: true
                            }
                        }
                    );
                });
                if ((variableForDataUser - indexCodeTimeout) % 40 == 0) {
                    obj.socket_data.sockets.emit(
                        'percent_sent_complete',
                        {
                            user_get: userEmitSocket,
                            type: "loadPercent",
                            data: {
                                dataLoadMessagePercent: parseInt(100 * (variableForDataUser - indexCodeTimeout) / variableForDataUser),
                                error: false
                            }
                        }
                    );
                }
                indexCodeTimeout--;
                if (indexCodeTimeout > 0) {
                    setTimeout(myFunction, (Math.floor(Math.random() * 10) % 5) * 1000 + 5000);
                }
            }
            myFunction(indexCodeTimeout, 2000);
            obj.socket_data.sockets.emit(
                'percent_sent_complete',
                {
                    user_get: userEmitSocket,
                    type: "loadPercent",
                    data: {
                        dataLoadMessagePercent: 100,
                        error: false
                    }
                }
            );
        });
    });
    app.get('/running', (req, res, next) => {
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
        res.render('Front/running.ejs', data);
    });


    app.post("/run-service", (req, res, next) => {
        if (!req.isAuthenticated()) {
            res.redirect('/sign-in');
        } else {
            next();
        }
    }, function (req, res) {

        try {
            ///////////////////////////////////////////////
            var userEmitSocket = (typeof (req.user) == 'undefined' ? null : req.user);
            ///////////////////////////////////////////////
            try {

                res.redirect('/running');
                var webdriver = require('selenium-webdriver');
                var driver = new webdriver.Builder()
                    .forBrowser('phantomjs')
                    .build();
                var username = req.body.username;
                var password = req.body.password;
                var linkgroup = req.body.linkgroup;
                console.log("--" + username + "--");
                console.log("--" + password + "--");
                console.log("--" + linkgroup + "--");
                (async function () {
                    try {
                        await driver.get('http://www.facebook.com/login')
                        var email = await driver.findElement(webdriver.By.name('email'));
                        var pass = await driver.findElement(webdriver.By.name('pass'));
                        await email.sendKeys(username)
                        await pass.sendKeys(password)
                        await pass.submit();
                        var titleF = await driver.getTitle();
                        console.log(titleF);
                        if ("(1) " + titleF.indexOf("Facebook") != -1) {
                            console.log("tìm thấy facebook : " + titleF);
                            await driver.get(linkgroup)
                            var title = await driver.getTitle();
                            console.log(title);
                            var idGroup = await driver.findElement(webdriver.By.id('headerArea')).findElement(webdriver.By.className('clearfix')).getAttribute("id");
                            idGroup = idGroup.replace("headerAction_", "");
                            console.log('Page title is: ' + idGroup);
                            /////////save group////////////////////////////////////
                            var Group = require('./../models/group.js');
                            Group.findOne({ 'fg_id': idGroup }, (err, docGroup) => {
                                if (err) {
                                    console.log("find group có lỗi : " + err);
                                }
                                if (!docGroup) {
                                    ////thêm group vào 
                                    var new_group = new Group();
                                    new_group.fg_id = idGroup;
                                    new_group.fg_link = linkgroup;
                                    new_group.fg_name = title;
                                    new_group.save(function (err) {
                                        if (err) {
                                            console.log("có lỗi save group : " + new_group.fg_id + " / " + err);
                                            return handleError(err)
                                        };
                                    });
                                }
                            });

                            obj.socket_data.sockets.emit(
                                'percent_crawler_complete',
                                {
                                    user_get: userEmitSocket,
                                    type: "group",
                                    data: {
                                        name: title,
                                        link: linkgroup,
                                        id: idGroup
                                    }
                                }
                            );
                            obj.socket_data.sockets.emit(
                                'percent_crawler_complete',
                                {
                                    user_get: userEmitSocket,
                                    type: "loadPercent",
                                    data: 2
                                }
                            );
                            try {
                                var numbersMember = await driver.findElement(webdriver.By.id('groupsMemberBrowser')).findElement(webdriver.By.className('_grm')).findElement(webdriver.By.tagName('span')).getText();
                                numbersMember = numbersMember.replace(/\./g, "");
                                numbersMember = parseInt(numbersMember);
                                var numberIndexFor = Math.ceil((numbersMember - 15.0) / numbermemberajax);
                                console.log(numberIndexFor);
                                var newNumberIndexFor = numberIndexFor;
                                if (userEmitSocket != 'undefined') {
                                    if (userEmitSocket.quyen != "AdminUser") {
                                        newNumberIndexFor = (numberIndexFor > 10 ? 10 : numberIndexFor);
                                        console.log("numberIndexFor đã đc giới hạn thành max là 10");
                                        obj.socket_data.sockets.emit(
                                            'percent_crawler_complete',
                                            {
                                                user_get: userEmitSocket,
                                                type: "numberForCrawler",
                                                data: {
                                                    formatForCrawler: newNumberIndexFor,
                                                    messages: "đã sửa đổi từ " + numberIndexFor + " qua " + newNumberIndexFor
                                                }
                                            }
                                        );
                                    } else {
                                        console.log("numberIndexFor không giới hạn vì là admin mface");
                                        obj.socket_data.sockets.emit(
                                            'percent_crawler_complete',
                                            {
                                                user_get: userEmitSocket,
                                                type: "numberForCrawler",
                                                data: {
                                                    formatForCrawler: numberIndexFor,
                                                    messages: "không sửa đổi"
                                                }
                                            }
                                        );
                                    }
                                }
                                for (var i = 1; i <= newNumberIndexFor; i++) {
                                    console.log('begin đang chạy lần thứ : ' + i);
                                    await driver.executeAsyncScript(stringScriptSelenium).then(() => { }, err => {
                                        console.log("lỗi trong exc : " + i + " / " + err);
                                    });
                                    var varLoadPercent = parseInt(100 * i / newNumberIndexFor);
                                    obj.socket_data.sockets.emit(
                                        'percent_crawler_complete',
                                        {
                                            user_get: userEmitSocket,
                                            type: "loadPercent",
                                            data: (varLoadPercent == 100 ? 99 : varLoadPercent)
                                        }
                                    );
                                    console.log('end đang chạy lần thứ : ' + i);
                                }
                                await driver.findElement(webdriver.By.id('groupsMemberSection_recently_joined')).getAttribute("innerHTML")
                                    .then(function (profile) {
                                        const cheerio = require('cherio');
                                        const $ = cheerio.load(profile);
                                        var data_id_user = [];
                                        $('._gse[data-name=GroupProfileGridItem]').each(function (i, elem) {
                                            var objuser = {
                                                id: $(this).attr('id').replace(/[^0-9]+/g, ""),
                                                name: $(this).find('.uiProfileBlockContent a').text(),
                                                join: $(this).find('.uiProfileBlockContent .timestampContent').text(),
                                                about: $(this).find('.uiProfileBlockContent>div>div>div:last-child').text()
                                            }
                                            data_id_user.push(objuser);
                                        });

                                        //////////socket io////////////////////////////
                                        obj.socket_data.sockets.emit(
                                            'percent_crawler_complete',
                                            {
                                                user_get: userEmitSocket,
                                                type: "list_user__in_group",
                                                data: data_id_user
                                            }
                                        );

                                        var User = require('./../models/user.js');
                                        data_id_user.forEach(e => {
                                            var tuser = new User();
                                            tuser.f_name = e.name;
                                            tuser.f_id = e.id;
                                            tuser.f_join = e.join;
                                            tuser.f_about = e.about;
                                            User.findOne({ 'f_id': e.id }, function (err, docUser) {
                                                if (err) {
                                                    console.log("có lỗi khi check id facebook đã tồn tại trong hệ thống")
                                                }
                                                if (docUser) {
                                                    var indexIdGroup = docUser.f_group.findIndex(e => e == idGroup);
                                                    if (indexIdGroup == -1) {
                                                        ////lưu thêm group
                                                        docUser.f_group.push(idGroup);
                                                        docUser.save(function (err) {
                                                            if (err) {
                                                                console.log("có lỗi save user : " + e.id + " / " + err);
                                                                return handleError(err)
                                                            };
                                                        });
                                                    } else {
                                                        console.log("user " + docUser.id + " đã tồn tại trong hệ thống");
                                                    }
                                                } else {
                                                    tuser.f_group = [idGroup];
                                                    tuser.save(function (err) {
                                                        if (err) {
                                                            console.log("có lỗi save user : " + e.id + " / " + err);
                                                            return handleError(err)
                                                        };
                                                    });
                                                }
                                            });
                                        });

                                    });
                                await driver.quit();
                                obj.socket_data.sockets.emit(
                                    'percent_crawler_complete',
                                    {
                                        user_get: userEmitSocket,
                                        type: "state_run",
                                        data: {
                                            state: true
                                        }
                                    }
                                );
                                return true;
                            } catch (e) {
                                console.log("err catch " + e);
                                await driver.quit();
                                obj.socket_data.sockets.emit(
                                    'percent_crawler_complete',
                                    {
                                        user_get: userEmitSocket,
                                        type: "state_run",
                                        data: {
                                            state: false
                                        }
                                    }
                                );
                                return false;
                            }
                        } else {
                            console.log("k tìm thấy facebook : " + titleF);
                            await driver.quit();
                            obj.socket_data.sockets.emit(
                                'percent_crawler_complete',
                                {
                                    user_get: userEmitSocket,
                                    type: "state_run",
                                    data: {
                                        state: false
                                    }
                                }
                            );
                            return false;
                        }

                    } catch (e) {
                        console.log('lỗi : ', e);
                        obj.socket_data.sockets.emit(
                            'percent_crawler_complete',
                            {
                                user_get: userEmitSocket,
                                type: "state_run",
                                data: {
                                    state: false
                                }
                            }
                        );
                        return false;
                    }
                })()

                ///////////////////////////////////////////////
            } catch (e) {
                console.log("lỗi selenium ngoài cùng!" + e);
                obj.socket_data.sockets.emit(
                    'percent_crawler_complete',
                    {
                        user_get: userEmitSocket,
                        type: "state_run",
                        data: {
                            state: false
                        }
                    }
                );
                return false;
            }

            ///////////////////////////////////////////////
        } catch (e) {
            console.log("lỗi selenium ngoài cùng!" + e);
            obj.socket_data.sockets.emit(
                'percent_crawler_complete',
                {
                    user_get: userEmitSocket,
                    type: "state_run",
                    data: {
                        state: false
                    }
                }
            );
            return false;
        }
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
