const mongoose = require("mongoose");

const dbUrl = process.env.MONGODB_URI;

class AppDataSource{
    static async connect(){
        await mongoose.connect(dbUrl);
    }
    static async disconnect(){
        await mongoose.disconnect();
    }
}

module.exports = AppDataSource;
