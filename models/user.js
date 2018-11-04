// app/models/user.js
var mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');
const userSchema = mongoose.Schema({

    local            : {
        username     : String,
        password     : String,
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }
});
// Các phương thức ======================
// Tạo mã hóa mật khẩu
userSchema.methods.generateHash = function(password) {
    var res = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    return res;
};

// kiểm tra mật khẩu có trùng khớp
userSchema.methods.validPassword = function(password) {
    var bcrypt   = require('bcrypt-nodejs');
    var res = bcrypt.compareSync(password, this.local.password);
    return res;
};
class User{
    constructor() {
        return mongoose.model('User', userSchema);
    }
}
module.exports = new User();

