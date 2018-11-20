// app/models/user.js
var mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

const userSchema = new Schema({
    email        : String,
    password     : String,
    quyen        : String,
    sdt          : Number,
    f_name       : String,
    f_id         : String,
    f_join       : String,
    f_about      : String,
    f_group      : Array,
    f_message    : Array,
    create       : Date,
    update       : Date,
    childId      : ObjectId
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
    var res = bcrypt.compareSync(password, this.password);
    return res;
};

module.exports = mongoose.model('User', userSchema);

