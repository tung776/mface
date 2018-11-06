// app/models/user.js
var mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

const userSchema = new Schema({
    email        : String,
    password     : String,
    quyen        : String,
    topicPR      : String,
    sdt          : Number,
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

