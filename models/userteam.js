const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const autoIncrement = require('mongoose-auto-increment');


const DB_URL = `mongodb://${process.env.DB_SERVER}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
var connection = mongoose.createConnection(DB_URL,{
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
autoIncrement.initialize(connection);


const userteamSchema = new mongoose.Schema({
    teamName: {
      type: String,
      default: "",
    },
    tagLine: {
      type: String,
      default: "",
    },
    sports_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sports",
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    teamColour_id: { //colour id 
      type: mongoose.Schema.Types.ObjectId,
      ref: "colourCodes",
    },
    coverPhoto: {
      type: String,
    },
    logo: {
      type: String,
    },
    user_id: { //creator id
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    aboutCreator: {
      type: Object,
      default: null
    },
    creatorIsAdmin: {
      type: Boolean,
      default: false
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId
      }
    ] ,//request accepted user's id
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId
      }
    ] , // admin user's id
    status: {
      type: Boolean,
      default: true
    },
  },

  {
    timestamps: true,
  }
);
userteamSchema.indexes({
  teamName: 1,
  unique: true
});

userteamSchema.plugin(autoIncrement.plugin, {
  model: 'user_teams',
  field: 'teamId',
  startAt: 1000,
  incrementBy: 1
});


module.exports = mongoose.model("user_teams", userteamSchema);