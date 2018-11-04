let mongoose = require('mongoose');
let config = require('./env.js');

const dbConnect = config.database.DB_CONNECTION;        // mongodb
const dbHost = config.database.DB_HOST;                 // 127.0.0.1
const dbPort = config.database.DB_PORT;                 // 27017
const dbName = config.database.DB_DATABASE;             // framework


class Database {
    constructor() {
        this._connect()
    }
    _connect() {
        var MongoLabUri = 'mongodb://admin:hungtt266@ds233218.mlab.com:33218/framework';
        var MongoDefault = `${dbConnect}://${dbHost}:${dbPort}/${dbName}`;
        mongoose.connect(MongoLabUri ,  { useNewUrlParser: true })
            .then(() => {
                console.log('Database connection thành công')
            })
            .catch(err => {
                console.error('Database connection có lỗi : '+ err)
            })
    }
}

module.exports = new Database()