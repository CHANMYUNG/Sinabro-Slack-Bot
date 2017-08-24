let mongoose = require('mongoose');
let database = {};

database.connect = function () {
    mongoose.Promise = global.Promise;
    //console.log(process.env.DB_URL);
    console.log(process.env.ADVANCED_SINABRO_BOT_DB_URL);
    mongoose.connect('mongodb://localhost:27017/bot');
    database.connection = mongoose.connection;
    database.connection.on('error', console.error.bind(console, 'mongoose connection error.'));
    database.connection.on('open', function () {
        console.log('CONNECTED TO DATABASE');

    });
    database.connection.on('disconnected', () => {
        console.log('ERROR OCCURRED');
    });
}


module.exports = database;