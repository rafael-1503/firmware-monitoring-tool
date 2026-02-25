const mongoose = require('mongoose');

function initDatabaseConnection(){
    const mongoDB = `mongodb://root:example@mongo:27017/firmware-monitoring?authSource=admin`;
    mongoose.connect(mongoDB);

    //Get default connection
    const db = mongoose.connection;

    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.once('open', function() {
        console.log("MongoDB connected");
    });
}

module.exports = initDatabaseConnection;