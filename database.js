let mongoose = require('mongoose');
let config = require('./env.js');

const dbConnect = config.database.DB_CONNECTION;        // mongodb
const dbHost = config.database.DB_HOST;                 // 127.0.0.1
const dbPort = config.database.DB_PORT;                 // 27017
const dbName = config.database.DB_DATABASE;             // framework
//mLap : thanhhung.dev hungtt@266

class Database {
    constructor() {
        this._connect()
    }
    _connect() {
        var MongoLabUri = 'mongodb://thanhhungdev:1234567890hung@ds123136.mlab.com:23136/mface';
        //var MongoDefault = `${dbConnect}://${dbHost}:${dbPort}/${dbName}`;
        mongoose.connect(MongoLabUri ,  { useNewUrlParser: true })
            .then(() => {
                console.log('Database connection thành công '+ MongoLabUri)
            })
            .catch(err => {
                console.error('Database connection có lỗi : '+ err)
            });
    }
}

module.exports = new Database()