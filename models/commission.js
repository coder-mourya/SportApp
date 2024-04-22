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

const commissionSchema = new mongoose.Schema({
        type: {
            type: String,
            enum: ['platformFees', 'commission']
        },
        commissionId : {
            type: String,
        },
        commissionType: {
            type: String,
            enum: ['percent', 'amount'],
        },
        applicableTo: {
            type: String,
            enum: ['trainingSessions', 'coachBookings', 'equipmentRental'],
        },
        criteria: {
            type: String,
            enum: ['sports', 'country', 'state', 'city', 'facility'],
        },
        sportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "sports"
        },
        country: {
            type: String,
            default: null
        },
        state: {
            type: String,
            default: ""
        },
        city: {
            type: String,
            default: ""
        },
        facilityId: [{ //facility branches id
            type: mongoose.Schema.Types.ObjectId,
            ref: 'facilityBranch',
            default: null
        }],
        amount: {
            type: Number,
            default: null
        },
        percent: {
            type: Number,
            default: null
        },
        dateFrom: {
            type: Date,
            default: true,
        },
        dateTo: {
            type: Date,
            default: false,
        },
        status: {
            type : Boolean,
            default : true
        }
    },

    {
        timestamps: true,
    }
);
commissionSchema.indexes({
    commissionType: 1
});

commissionSchema.plugin(autoIncrement.plugin, {
    model: 'commissions',
    field: 'commissionId',
    startAt: 1000,
    incrementBy: 1
  });


module.exports = mongoose.model("commissions", commissionSchema);