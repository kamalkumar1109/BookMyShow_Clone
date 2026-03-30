const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const app = require("./app");
const AppDataSource = require('./data-source');

const PORT = 8080;

(async() => {
    try{
        await AppDataSource.connect();
        console.log('Connection Open'); //winston logger
        app.listen(PORT, ()=> {
            console.log(`server running at port ${PORT}`);
        })
    }
    catch(err){
        console.log(err);
    }
})()