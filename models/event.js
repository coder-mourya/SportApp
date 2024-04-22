const mongoose = require("mongoose");

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


const eventSchema = new mongoose.Schema({
        creatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        eventId : {
            type: String,
        },
        eventName: {
            type: String
        },
        eventType: {
            type: String,
            enum: ["practice", "game", "tournament"]
        },
        teamId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "user_teams"
        },
        opponentName: {
            type: String,
            default: ""
        },
        sportId: { // sport type id
            type: mongoose.Schema.Types.ObjectId,
            ref: "sports"
        },
        facilityId: { // facility type id
            type: mongoose.Schema.Types.ObjectId,
            ref:  "facilityBranch",
        },
        eventDate: {
            type: String,
        },
        eventDateUTC: {
            type: String,
            default: null 
        },
        startTime: {
            type: String
        },
        endTime: {
            type: String,
            default: ""
        },
        endTimeUTC: {
            type: String,
            default: ""
        },
        notes: {
            type: String
        },
        teamIds: [], // selected team ids in event
        members: [],//request accepted user's id
        admins: [] , // admin user's ids
        location: {
            type: {
                type: String,
                default: "Point",
            },
            coordinates: {
                type: [Number],
                default: [0, 0] //[longitude,latitude]
            },
        },
        address: {
            type: String,
            default: ""
        },
        accountDetails : {
            type : String,
            default : null
        },
        //total invited user
        totalRequestedUser: {
            type: Number,
            default: 0
        },
        //total request accepted user
        totalRequestAcceptedUser: {
            type: Number,
            default: 0
        },
        //total request rejected user
        totalRequestRejectedUser: {
            type: Number,
            default: 0
        },
        creatorIsAdmin: {
            type: Boolean,
            default: false
        },  
        isComplete: {
            type: Boolean,
            default: false
        }, 
        isSplitEqually: {
            type: Boolean,
            default: false
        }, 
        isSplitPayment: {
            type: Boolean,
            default: false
        }, 
        SplitPaymentBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        }, 
        totalExpenses :{
            type: Number,
            default: ""
        },
        currencyCode: {
            type: String,
        },
        perHeadExpenses :{
            type: Number,
            default: ""
        },
        paymentStatus: {
            type: Number,
            enum: [1, 2], //1=>pending payment ,2=>paid payment
            default: 1
        },
        isAllPaymentsConfirmed: {
            type: Boolean,
            default: false
        },
        status: {
            type: Boolean,
            default: true
        },

    },

    {
        timestamps: true,
    }
);
eventSchema.indexes({
    eventName: 1,
    eventType: 1
});

eventSchema.plugin(autoIncrement.plugin, {
    model: 'events',
    field: 'eventId',
    startAt: 1000,
    incrementBy: 1
  });

//user team/normal/family/event members
module.exports = mongoose.model("events", eventSchema);