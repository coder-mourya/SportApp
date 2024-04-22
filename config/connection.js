var mongoose = require("mongoose");
require("dotenv").config();

// use env varibale here.. /;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const server = process.env.DB_SERVER;
const dbport = process.env.DB_PORT;
const database = process.env.DB_NAME;

// connect database code //;

//
class Database {
  constructor() {
    this._connect();
  }
  _connect() {
    if (process.env.NODE_ENV != "localhost") {
      mongoose
        .connect(`mongodb://${server}:${dbport}/${database}`, {
          auth: {
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
          },
          useUnifiedTopology: true,
          useNewUrlParser: true,
          // seCreateIndex: true,
          keepAlive: true,
          //useFindAndModify: false,
        })
        .then(() => {
          console.log(
            "Database connected successful==" +
            `mongodb://${server}:${dbport}/${database}`
          );
        })
        .catch((err) => {
          console.error("Database connection error::" + err);
        });
    } else {
      let uri = 'mongodb://localhost:27017/sportnerve';
      mongoose.connect(uri, {})
        .then(result => console.log('Database connected successfully ===', uri))
        .catch(err => console.log(err));
    }
  }
}
module.exports = new Database();
