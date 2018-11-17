// app/models/group.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const groupSchema = new Schema({
    fg_name         : String,
    fg_link         : String,
    fg_id           : String,
});
module.exports = mongoose.model('Group', groupSchema);