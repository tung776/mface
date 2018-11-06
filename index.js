
const express = require('express');
const app = express();
const path = require('path');
const passport = require('passport');
const flash = require('connect-flash');

const session = require('express-session');
var Config = require('./env.js');
app.locals.inspect = require('util').inspect;
/**
 * khỏi tạo ban đầu
 */
app.set('view engine', 'ejs');
app.set('views', './views');
app.use("/public", express.static(path.join(__dirname, 'public')));
/***
 * các khởi tạo middleware cho passport
 */
/////////////////////////////////////////////////////////////////////////
// for parsing application/x-www-form-urlencoded/////////////////////////
/////////////////////////////////////////////////////////////////////////
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
/////////////////////////////////////////////////////////////////////////
// khỏi tạo middleware lắng nghe request của pasport ////////////////////
/////////////////////////////////////////////////////////////////////////
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.serializeUser(function (id, done) {
    done(null, id);
});
passport.deserializeUser(function (id, done) {
    var user = require('./models/user.js');
    user.findOne({ "_id": id }).exec(function (err, data) {
        if (err)
            return done(err);
        if (!data) {
            return done(null, false, req.flash('loginMessage', 'không thấy user.'));
        } else {
            data.password = null;
            return done(null, data)
        }
    });
});

/////////////////////////////////////////////////////////////////////////
///////set route project/////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
var object_Route = {
    linkDomain : Config.env.isLocal == true ? Config.env.inLocal.link : Config.env.inServer.link
};
require('./route/routes.js')(app, passport, object_Route);
/////////////////////////////////////////////////////////////////////////
/////thêm middleware/////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
//require('./middleware/middleware.js').Middleware({ app });
/**
 * thiết lập bộ lắng nghe sự kiện
 */
var server = require('http').createServer(app);
server.listen(Config.env.port, () => {
    console.log('server đang lắng nghe: ' + server.address().address + ":" + server.address().port);
});


require('./database.js');
