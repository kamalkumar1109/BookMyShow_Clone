const mongoose = require("mongoose");
const { mongoUri: dbUrl } = require("./config/env");

class AppDataSource{
    static async connect(){
        await mongoose.connect(dbUrl);
    }
    static async disconnect(){
        await mongoose.disconnect('');
    }
}

module.exports = AppDataSource;