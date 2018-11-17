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
    var xemthem = document.getElementById("groupsMemberSection_recently_joined").getElementsByClassName("stat_elem")[0].getElementsByTagName('a')[0];
	xemthem.href = xemthem.href.replace('&limit=15&', '&limit=`+ numbermemberajax + `&');
	console.log(xemthem.href);
    xemthem.click();
    window.setTimeout(arguments[arguments.length - 1], 8000);
    `;
    function createStringScriptSelenium(numbermemberajax) {
        return `
        if(!document.getElementById("MFace_old_document_height")){
            var parent = document.getElementsByTagName('body')[0];
            var newChild = '<p id="MFace_old_document_height">0</p>';
            parent.insertAdjacentHTML('afterbegin', newChild);
        }

        
        var old_document_height = document.body.clientHeight;
        document.getElementById("MFace_old_document_height").innerHTML = old_document_height;

        var xemthem = document.getElementById("groupsMemberSection_recently_joined").getElementsByClassName("stat_elem")[0].getElementsByTagName('a')[0];
        xemthem.href = xemthem.href.replace('&limit=15&', '&limit=400&');
        console.log(xemthem.href);
        xemthem.click();

        window.setTimeout(function(){
            var old_docu_height = document.getElementById("MFace_old_document_height").innerHTML;
            console.log("trước là hàng cũ trước 5s "+ old_docu_height + " / " + document.body.clientHeight + " " + new Date())
            if(old_docu_height < document.body.clientHeight){
                console.log("lớn hơn rùi" + new Date())
                arguments[arguments.length - 1];
            }else{
                console.log(123456789);
            }
        },6000);
        `;
    };
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
    
    
    app.get("/test-save", function (req, res) {
        var Group = require("./../models/group");
        var newGroup = new Group();
        newGroup.name = req.body.groupName;
        newGroup.link = req.body.groupLink;
        newGroup.id = req.body.groupId;
        newGroup.save(err=>{
            if (err) return handleError(err);
        });
        res.send("hùng thực hiện xong");
    });
    
    app.post('/sent-messager', (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.redirect('/sign-in');
        } else {
            next();
        }
    }, (req, res) => {
        res.redirect('/sending');
        const login = require("facebook-chat-api");
        // Create simple echo bot
        login({ email: req.body.username, password: req.body.password }, (err, api) => {
            if (err) {
                obj.socket_data.sockets.emit('percent_sent_message_complete', { user_get: (typeof (req.user) == 'undefined' ? null : req.user), dataLoadMessagePercent: 100, error : true });
                return console.error(err);
            }
            obj.socket_data.sockets.emit('percent_sent_message_complete', { user_get: (typeof (req.user) == 'undefined' ? null : req.user), dataLoadMessagePercent: 2 });
            console.log("data id : " + req.body.dataUserFacebook)
            var dataUserFacebook = JSON.parse(req.body.dataUserFacebook);
            console.log(dataUserFacebook);
            var variableForDataUser = dataUserFacebook.length;
            
            //cứ 2s lôi db ra mà chạy
            var indexCodeTimeout = 10;
            function myFunction() {
                console.log('begin run send message at '+ indexCodeTimeout);
                api.sendMessage(req.body.message, dataUserFacebook[variableForDataUser - indexCodeTimeout], (err) => {
                    console.log("send done : "  );
                    console.log(err);
                    obj.socket_data.sockets.emit('percent_sent_message_complete', { user_get: (typeof (req.user) == 'undefined' ? null : req.user), dataLoadMessagePercent: 5 });
                });
                if ((variableForDataUser - indexCodeTimeout) % 40 == 0) {
                    obj.socket_data.sockets.emit('percent_sent_message_complete', { user_get: (typeof (req.user) == 'undefined' ? null : req.user), dataLoadMessagePercent: parseInt(100 * (variableForDataUser - indexCodeTimeout) / variableForDataUser) });
                }
                indexCodeTimeout--;
                if (indexCodeTimeout > 0) {
                    setTimeout(myFunction, (Math.floor(Math.random() * 10)%5)*1000 + 5000);
                }
            }
            myFunction(indexCodeTimeout , 2000);
            obj.socket_data.sockets.emit('percent_sent_message_complete', { user_get: (typeof (req.user) == 'undefined' ? null : req.user), dataLoadMessagePercent: 100 });
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
    app.get("/selenium/phantom", function (req, res) {
        try {

            res.redirect('/running');
            var webdriver = require('selenium-webdriver');
            var driver = new webdriver.Builder()
                .forBrowser('phantomjs')
                .build();
            var username = '';
            var password = '';
            var linkgroup = 'https://www.facebook.com/groups/TOEICTNTRAM/members/';
            var messageClient = 'req.body.message';
            if (!username.trim()) { username = '+841217581480'; password = 'hungtt@266' }
            console.log(username);
            console.log(password);
            console.log(linkgroup);
            console.log(messageClient);
            (async function () {
                try {
                    await driver.get('http://www.facebook.com/login')
                    var email = await driver.findElement(webdriver.By.name('email'));
                    var pass = await driver.findElement(webdriver.By.name('pass'));
                    await email.sendKeys(username)
                    await pass.sendKeys(password)
                    await pass.submit();
                    await driver.get(linkgroup)
                    var title = await driver.getTitle()
                    console.log('Page title is: ' + title);
                    obj.socket_data.sockets.emit('percent_crawler_complete', { user_get: (typeof (req.user) == 'undefined' ? null : req.user), dataLoadpercent: 2 });
                    try {
                        var numbersMember = await driver.findElement(webdriver.By.id('groupsMemberBrowser')).findElement(webdriver.By.className('_grm')).findElement(webdriver.By.tagName('span')).getText();
                        numbersMember = numbersMember.replace(/\./g, "");
                        numbersMember = parseInt(numbersMember);
                        var numberIndexFor = Math.ceil((numbersMember - 15.0) / numbermemberajax);
                        console.log(numberIndexFor);
                        numberIndexFor = numberIndexFor > 4 ? 4 : numberIndexFor;
                        for (var i = 1; i <= numberIndexFor; i++) {
                            console.log('begin đang chạy lần thứ : ' + i);
                            await driver.executeAsyncScript(stringScriptSelenium).then(() => { }, err => {
                                console.log("lỗi trong exc : " + i + " / " + err);
                            });//
                            obj.socket_data.sockets.emit('percent_crawler_complete', { user_get: (typeof (req.user) == 'undefined' ? null : req.user), dataLoadpercent: parseInt(100 * i / numberIndexFor) });
                            console.log('end đang chạy lần thứ : ' + i);
                        }
                        await driver.findElement(webdriver.By.id('groupsMemberSection_recently_joined')).getAttribute("innerHTML")
                            .then(function (profile) {
                                const cheerio = require('cherio');
                                const $ = cheerio.load(profile)
                                var data_id_user = [];
                                $('._gse[data-name=GroupProfileGridItem]').each(function (i, elem) {

                                    //http://graph.facebook.com/67563683055/picture?type=
                                    var objuser = {
                                        id: $(this).attr('id').replace(/[^0-9]+/g, ""),
                                        name: $(this).find('.uiProfileBlockContent a').text(),
                                        join: $(this).find('.uiProfileBlockContent .timestampContent').text(),
                                        about: $(this).find('.uiProfileBlockContent>div>div>div:last-child').text()
                                    }
                                    data_id_user.push(objuser);

                                });
                                //////////socket io////////////////////////////
                                obj.socket_data.sockets.emit('list_user__in_group', { user_get: typeof (req.user) == 'undefined' ? null : req.user, data: data_id_user });
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

            ///////////////////////////////////////////////
        } catch (e) {
            console.log("lỗi selenium ngoài cùng!" + e)
        }
    });

    app.post("/run-service", (req, res, next) => {
        if (!req.isAuthenticated()) {
            res.redirect('/sign-in');
        } else {
            next();
        }
    }, function (req, res) {
        try {
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
                console.log(linkgroup);
                (async function () {
                    try {
                        await driver.get('http://www.facebook.com/login')
                        var email = await driver.findElement(webdriver.By.name('email'));
                        var pass = await driver.findElement(webdriver.By.name('pass'));
                        await email.sendKeys(username)
                        await pass.sendKeys(password)
                        await pass.submit();
                        await driver.get(linkgroup)
                        var title = await driver.getTitle()
                        var idGroup = await driver.findElement(webdriver.By.id('headerArea')).findElement(webdriver.By.className('clearfix')).getAttribute("id"); 
                        idGroup = idGroup.replace("headerAction_", "");
                        console.log('Page title is: ' + idGroup);

                        obj.socket_data.sockets.emit('groupinfor', { user_get: (typeof (req.user) == 'undefined' ? null : req.user), group : { name : title, link : linkgroup , id :  idGroup} });
                        obj.socket_data.sockets.emit('percent_crawler_complete', { user_get: (typeof (req.user) == 'undefined' ? null : req.user), dataLoadpercent: 2 });
                        try {
                            var numbersMember = await driver.findElement(webdriver.By.id('groupsMemberBrowser')).findElement(webdriver.By.className('_grm')).findElement(webdriver.By.tagName('span')).getText();
                            numbersMember = numbersMember.replace(/\./g, "");
                            numbersMember = parseInt(numbersMember);
                            var numberIndexFor = Math.ceil((numbersMember - 15.0) / numbermemberajax);
                            console.log(numberIndexFor);
                            numberIndexFor = numberIndexFor > 4 ? 4 : numberIndexFor;
                            for (var i = 1; i <= numberIndexFor; i++) {
                                console.log('begin đang chạy lần thứ : ' + i);
                                await driver.executeAsyncScript(stringScriptSelenium).then(() => { }, err => {
                                    console.log("lỗi trong exc : " + i + " / " + err);
                                });//
                                obj.socket_data.sockets.emit('percent_crawler_complete', { user_get: (typeof (req.user) == 'undefined' ? null : req.user), dataLoadpercent: parseInt(100 * i / numberIndexFor) });
                                console.log('end đang chạy lần thứ : ' + i);
                            }
                            await driver.findElement(webdriver.By.id('groupsMemberSection_recently_joined')).getAttribute("innerHTML")
                                .then(function (profile) {
                                    const cheerio = require('cherio');
                                    const $ = cheerio.load(profile)
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
                                    obj.socket_data.sockets.emit('list_user__in_group', { user_get: typeof (req.user) == 'undefined' ? null : req.user, data: data_id_user });
                                    var Group = require('./../models/group.js');
                                    Group.findOne({'fg_id' : idGroup }, (err, docGroup)=>{
                                        if(err){
                                            console.log("find group có lỗi : " + err);
                                        }
                                        if(!docGroup){
                                            ////thêm group vào 
                                            var new_group = new Group();
                                            new_group.fg_id = idGroup;
                                            new_group.fg_link = linkgroup;
                                            new_group.fg_name = title;
                                            new_group.save(function (err) {
                                                if (err) {
                                                    console.log("có lỗi save group : " +new_group.fg_id + " / "+ err);
                                                    return handleError(err)
                                                };
                                            });
                                        }
                                    });
                                    var User = require('./../models/user.js');
                                    data_id_user.forEach(e => {
                                        var tuser = new User();
                                        tuser.f_name = e.name;
                                        tuser.f_id = e.id;
                                        tuser.f_join = e.join;
                                        tuser.f_about = e.about;
                                        tuser.f_group = [idGroup];
                                        User.findOne({ 'f_id': e.id }, function (err, docUser) {
                                            if (err){
                                                console.log("có lỗi khi check id facebook đã tồn tại trong hệ thống")
                                            }
                                            if (docUser) {
                                                var indexIdGroup = docUser.f_group.findIndex(e => e == idGroup);
                                                if(indexIdGroup != -1 ){
                                                    ////lưu thêm group
                                                    docUser.f_group.push(idGroup);
                                                    docUser.save(function (err) {
                                                        if (err) {
                                                            console.log("có lỗi save user : " +e.id + " / "+ err);
                                                            return handleError(err)
                                                        };
                                                    });
                                                }else {
                                                    console.log("user "+ docUser.id + " đã tồn tại trong hệ thống");
                                                }
                                            } else {
                                                tuser.save(function (err) {
                                                    if (err) {
                                                        console.log("có lỗi save user : " +e.id + " / "+ err);
                                                        return handleError(err)
                                                    };
                                                });
                                            }
                                        });
                                    });
                                });
                            await driver.quit();
                            obj.socket_data.sockets.emit('state_run', { user_get: typeof (req.user) == 'undefined' ? null : req.user, state: true });
                            return true;
                        } catch (e) {
                            console.log("err catch" + e);
                            await driver.quit();
                            obj.socket_data.sockets.emit('state_run', { user_get: typeof (req.user) == 'undefined' ? null : req.user, state: false });
                            return false;
                        }
                    } catch (e) {
                        console.log('lỗi : ', e);
                        obj.socket_data.sockets.emit('state_run', { user_get: typeof (req.user) == 'undefined' ? null : req.user, state: false });
                        return false;
                    }
                })()

                ///////////////////////////////////////////////
            } catch (e) {
                console.log("lỗi selenium ngoài cùng!" + e);
                obj.socket_data.sockets.emit('state_run', { user_get: typeof (req.user) == 'undefined' ? null : req.user, state: false });
                return false;
            }

            ///////////////////////////////////////////////
        } catch (e) {
            console.log("lỗi selenium ngoài cùng!" + e);
            obj.socket_data.sockets.emit('state_run', { user_get: typeof (req.user) == 'undefined' ? null : req.user, state: false });
            return false;
        }
    });
    app.get("/selenium/chrome", function (req, res) {
        try {
            res.redirect('/running');
            var webdriver = require('selenium-webdriver');
            var chromeCapabilities = webdriver.Capabilities.chrome()
            var chromeOptions = {
                'args': ['--disable-infobars', "--disable-notifications"]
            };
            chromeCapabilities.set('chromeOptions', chromeOptions);
            var driver = new webdriver.Builder()
                .forBrowser('chrome')
                .withCapabilities(chromeCapabilities)
                .build();
            var username = '';
            var password = '';
            var linkgroup = 'https://www.facebook.com/groups/1365709000190455/members/';
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
                    driver.manage().timeouts().setScriptTimeout(12000);
                    await driver.get(linkgroup)
                    var title = await driver.getTitle()
                    console.log('Page title is: ' + title);
                    try {
                        var numbersMember = await driver.findElement(webdriver.By.id('groupsMemberBrowser')).findElement(webdriver.By.className('_grm')).findElement(webdriver.By.tagName('span')).getText();
                        numbersMember = numbersMember.replace(/\./g, "");
                        numbersMember = parseInt(numbersMember);
                        var numberIndexFor = Math.ceil((numbersMember - 15.0) / numbermemberajax);
                        console.log(numberIndexFor);
                        for (var i = 0; i < numberIndexFor; i++) {
                            console.log('begin đang chạy lần thứ : ' + i);
                            await driver.executeAsyncScript(stringScriptSelenium).then((data) => {
                                console.log("đây là return not timeout của data : " + data);
                            }, err => {
                                console.log(new Date());
                                console.log("lỗi trong exc :  / " + err);
                            });
                            console.log('end đang chạy lần thứ : ' + i);
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
                        });
                        //await driver.quit();
                    } catch (e) {
                        console.log("err catch" + e);
                        await driver.quit();
                    }

                } catch (e) {
                    console.log('lỗi : ', e);
                }
            })()
        } catch (e) {
            console.log("lỗi selenium ngoài cùng!" + e)
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
