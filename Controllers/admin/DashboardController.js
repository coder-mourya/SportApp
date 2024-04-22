const {
    Mongoose
} = require("mongoose");
const Boom = require("boom");
const User = require("../../models/user");
const UserTeam = require("../../models/userteam");
const Training = require("../../models/training");
const UserEvent = require("../../models/event");
const TrainingBooking = require("../../models/trainingBooking");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcrypt");
const moment = require("moment");
const axios = require('axios');
const {
    Validator
} = require("node-input-validator");
const i18n = require("i18n");
const SendResponse = require("../.././apiHandler");
const {
    dump
} = require("../../services/dump");
module.exports = {
    getUserGraph: async (req, res) => {
        try {
            // const v = new Validator(req.query, {
            //     startDate: "required",
            //     endDate: "required",

            // });
            // const CheckValidation = await v.check();
            // if (!CheckValidation) {
            //     let first_key = Object.keys(v.errors)[0];
            //     let err = v.errors[first_key]["message"];
            //     return SendResponse(res, {
            //         isBoom: true
            //     }, err, 422);
            // }
            let type = req.query.type ? req.query.type : 'weekly';
            let xAxis = [];
            let count = []
            if (type == 'weekly') {
                let startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
                let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
                xAxis = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                count = [0, 0, 0, 0, 0, 0, 0]
                const result = await User.aggregate([{
                        $match: {
                            createdAt: {
                                $gte: new Date(startDate - 7 * 24 * 60 * 60 * 1000), //                
                            },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                $dayOfWeek: '$createdAt',
                            },
                            count: {
                                $sum: 1,
                            },
                        },
                    }
                ]);
                for (let i = 0; i < result.length; i++) {
                    count[(result[i]._id) - 1] = result[i].count
                }
            } else if (type == 'monthly') {
                xAxis = [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December'
                ]
                count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                const currentDate = new Date();
                const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                const result = await User.aggregate([{
                        $match: {
                            createdAt: {
                                $lte: new Date(),
                            },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                $month: '$createdAt'
                            },
                            count: {
                                $sum: 1
                            },
                        },
                    },
                    {
                        $sort: {
                            '_id': 1 // Sort by date in ascending order
                        },
                    },
                ]);
                for (let i = 0; i < result.length; i++) {
                    count[(result[i]._id) - 1] = result[i].count
                }
            } else if (type == 'quarterly') {
                const currentDate = new Date();
                const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                xAxis = ['Q1', 'Q2', 'Q3', 'Q4']
                count = [0, 0, 0, 0]
                const result = await User.aggregate([{
                        $match: {
                            createdAt: {
                                $lte: new Date(),
                            },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                $subtract: [{
                                        $month: '$createdAt'
                                    },
                                    {
                                        $mod: [{
                                            $month: '$createdAt'
                                        }, 3]
                                    },
                                ],
                            },
                            count: {
                                $sum: 1
                            },
                        },
                    },
                    {
                        $sort: {
                            '_id': 1, // Sort by quarter in ascending order
                        },
                    }
                ]);
                for (let i = 0; i < result.length; i++) {
                    if (result[i]._id == 0) {
                        count[0] = result[i].count
                    } else if (result[i]._id == 3) {
                        count[1] = result[i].count
                    } else if (result[i]._id == 6) {
                        count[2] = result[i].count
                    } else {
                        count[3] = result[i].count
                    }
                }
            } else {
                const result = await User.aggregate([{
                        $match: {
                            createdAt: {
                                $lte: new Date(),
                            },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                year: {
                                    $year: '$createdAt'
                                },
                            },
                            count: {
                                $sum: 1
                            },
                        },
                    },
                    {
                        $sort: {
                            '_id.year': 1, // Sort by year in ascending order
                        },
                    },
                    {
                        $project: {
                            _id: 0, // Exclude the default MongoDB _id field
                            year: '$_id.year',
                            count: '$count',
                        },
                    },
                ]);

                for (let i = 0; i < result.length; i++) {
                    xAxis[i] = result[i].year
                    count[i] = result[i].count
                }
            }
            let data = {
                xAxis: xAxis,
                count: count,
            }
            return SendResponse(res, data, "User graph data", 200);


        } catch (error) {
            dump(error);
            return SendResponse(
                res, {
                    isBoom: true
                },
                "Something wents wrong, please try again",
                500
            );
        }
    },
    getEventGraph: async (req, res) => {
        try {
            // const v = new Validator(req.query, {
            //     startDate: "required",
            //     endDate: "required",

            // });
            // const CheckValidation = await v.check();
            // if (!CheckValidation) {
            //     let first_key = Object.keys(v.errors)[0];
            //     let err = v.errors[first_key]["message"];
            //     return SendResponse(res, {
            //         isBoom: true
            //     }, err, 422);
            // }
            let type = req.query.type ? req.query.type : 'weekly';
            let xAxis = [];
            let count = []
            let params = {}
            if (req.query.sportId) {
                params = Object.assign(params, {
                    sportId: req.query.sportId
                })
            }
            if (type == 'weekly') {
                let startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
                let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
                xAxis = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                count = [0, 0, 0, 0, 0, 0, 0]
                params = Object.assign(params, {
                    createdAt: {
                        $gte: new Date(startDate - 7 * 24 * 60 * 60 * 1000)
                    }
                })
                const result = await UserEvent.aggregate([{
                        $match: params
                    },
                    {
                        $group: {
                            _id: {
                                $dayOfWeek: '$createdAt',
                            },
                            count: {
                                $sum: 1,
                            },
                        },
                    }
                ]);
                for (let i = 0; i < result.length; i++) {
                    count[(result[i]._id) - 1] = result[i].count
                }
            } else if (type == 'monthly') {
                xAxis = [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December'
                ]
                count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                const currentDate = new Date();
                const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                params = Object.assign(params, {
                    createdAt: {
                        $lte: new Date()
                    }
                })
                const result = await UserEvent.aggregate([{
                        $match: params
                    },
                    {
                        $group: {
                            _id: {
                                $month: '$createdAt'
                            },
                            count: {
                                $sum: 1
                            },
                        },
                    },
                    {
                        $sort: {
                            '_id': 1 // Sort by date in ascending order
                        },
                    },
                ]);
                for (let i = 0; i < result.length; i++) {
                    count[(result[i]._id) - 1] = result[i].count
                }
            } else if (type == 'quarterly') {
                const currentDate = new Date();
                const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                xAxis = ['Q1', 'Q2', 'Q3', 'Q4']
                count = [0, 0, 0, 0]
                params = Object.assign(params, {
                    createdAt: {
                        $lte: new Date()
                    }
                })
                const result = await UserEvent.aggregate([{
                        $match: params
                    },
                    {
                        $group: {
                            _id: {
                                $subtract: [{
                                        $month: '$createdAt'
                                    },
                                    {
                                        $mod: [{
                                            $month: '$createdAt'
                                        }, 3]
                                    },
                                ],
                            },
                            count: {
                                $sum: 1
                            },
                        },
                    },
                    {
                        $sort: {
                            '_id': 1, // Sort by quarter in ascending order
                        },
                    }
                ]);
                for (let i = 0; i < result.length; i++) {
                    if (result[i]._id == 0) {
                        count[0] = result[i].count
                    } else if (result[i]._id == 3) {
                        count[1] = result[i].count
                    } else if (result[i]._id == 6) {
                        count[2] = result[i].count
                    } else {
                        count[3] = result[i].count
                    }
                }
            } else {
                params = Object.assign(params, {
                    createdAt: {
                        $lte: new Date()
                    }
                })
                const result = await UserEvent.aggregate([{
                        $match: params
                    },
                    {
                        $group: {
                            _id: {
                                year: {
                                    $year: '$createdAt'
                                },
                            },
                            count: {
                                $sum: 1
                            },
                        },
                    },
                    {
                        $sort: {
                            '_id.year': 1, // Sort by year in ascending order
                        },
                    },
                    {
                        $project: {
                            _id: 0, // Exclude the default MongoDB _id field
                            year: '$_id.year',
                            count: '$count',
                        },
                    },
                ]);

                for (let i = 0; i < result.length; i++) {
                    xAxis[i] = result[i].year
                    count[i] = result[i].count
                }
            }
            let data = {
                xAxis: xAxis,
                count: count,
            }
            return SendResponse(res, data, "Event graph data", 200);


        } catch (error) {
            dump(error);
            return SendResponse(
                res, {
                    isBoom: true
                },
                "Something wents wrong, please try again",
                500
            );
        }
    },
    getTrainingGraph: async (req, res) => {
        try {
            // const v = new Validator(req.query, {
            //     startDate: "required",
            //     endDate: "required",

            // });
            // const CheckValidation = await v.check();
            // if (!CheckValidation) {
            //     let first_key = Object.keys(v.errors)[0];
            //     let err = v.errors[first_key]["message"];
            //     return SendResponse(res, {
            //         isBoom: true
            //     }, err, 422);
            // }
            let type = req.query.type ? req.query.type : 'weekly';
            let xAxis = [];
            let count = []
            let params = {}
            if (req.query.sportId) {
                params = Object.assign(params, {
                    sportId: req.query.sportId
                })
            }
            if (type == 'weekly') {
                let startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
                let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
                xAxis = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                count = [0, 0, 0, 0, 0, 0, 0]
                params = Object.assign(params, {
                    createdAt: {
                        $gte: new Date(startDate - 7 * 24 * 60 * 60 * 1000)
                    }
                })
                const result = await Training.aggregate([{
                        $match: params
                    },
                    {
                        $group: {
                            _id: {
                                $dayOfWeek: '$createdAt',
                            },
                            count: {
                                $sum: 1,
                            },
                        },
                    }
                ]);
                for (let i = 0; i < result.length; i++) {
                    count[(result[i]._id) - 1] = result[i].count
                }
            } else if (type == 'monthly') {
                xAxis = [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December'
                ]
                count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                const currentDate = new Date();
                const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                params = Object.assign(params, {
                    createdAt: {
                        $lte: new Date()
                    }
                })
                const result = await Training.aggregate([{
                        $match: params
                    },
                    {
                        $group: {
                            _id: {
                                $month: '$createdAt'
                            },
                            count: {
                                $sum: 1
                            },
                        },
                    },
                    {
                        $sort: {
                            '_id': 1 // Sort by date in ascending order
                        },
                    },
                ]);
                for (let i = 0; i < result.length; i++) {
                    count[(result[i]._id) - 1] = result[i].count
                }
            } else if (type == 'quarterly') {
                const currentDate = new Date();
                const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                xAxis = ['Q1', 'Q2', 'Q3', 'Q4']
                count = [0, 0, 0, 0]
                params = Object.assign(params, {
                    createdAt: {
                        $lte: new Date()
                    }
                })
                const result = await Training.aggregate([{
                        $match: params
                    },
                    {
                        $group: {
                            _id: {
                                $subtract: [{
                                        $month: '$createdAt'
                                    },
                                    {
                                        $mod: [{
                                            $month: '$createdAt'
                                        }, 3]
                                    },
                                ],
                            },
                            count: {
                                $sum: 1
                            },
                        },
                    },
                    {
                        $sort: {
                            '_id': 1, // Sort by quarter in ascending order
                        },
                    }
                ]);
                for (let i = 0; i < result.length; i++) {
                    if (result[i]._id == 0) {
                        count[0] = result[i].count
                    } else if (result[i]._id == 3) {
                        count[1] = result[i].count
                    } else if (result[i]._id == 6) {
                        count[2] = result[i].count
                    } else {
                        count[3] = result[i].count
                    }
                }
            } else {
                params = Object.assign(params, {
                    createdAt: {
                        $lte: new Date()
                    }
                })
                const result = await Training.aggregate([{
                        $match: params
                    },
                    {
                        $group: {
                            _id: {
                                year: {
                                    $year: '$createdAt'
                                },
                            },
                            count: {
                                $sum: 1
                            },
                        },
                    },
                    {
                        $sort: {
                            '_id.year': 1, // Sort by year in ascending order
                        },
                    },
                    {
                        $project: {
                            _id: 0, // Exclude the default MongoDB _id field
                            year: '$_id.year',
                            count: '$count',
                        },
                    },
                ]);

                for (let i = 0; i < result.length; i++) {
                    xAxis[i] = result[i].year
                    count[i] = result[i].count
                }
            }
            let data = {
                xAxis: xAxis,
                count: count,
            }
            return SendResponse(res, data, "Training graph data", 200);


        } catch (error) {
            dump(error);
            return SendResponse(
                res, {
                    isBoom: true
                },
                "Something wents wrong, please try again",
                500
            );
        }
    },
    getTeamGraph: async (req, res) => {
        try {
            // const v = new Validator(req.query, {
            //     startDate: "required",
            //     endDate: "required",

            // });
            // const CheckValidation = await v.check();
            // if (!CheckValidation) {
            //     let first_key = Object.keys(v.errors)[0];
            //     let err = v.errors[first_key]["message"];
            //     return SendResponse(res, {
            //         isBoom: true
            //     }, err, 422);
            // }
            let type = req.query.type ? req.query.type : 'weekly';
            let xAxis = [];
            let count = []
            let params = {}
            if (req.query.sportId) {
                params = Object.assign(params, {
                    sportId: req.query.sportId
                })
            }
            if (type == 'weekly') {
                let startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
                let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
                xAxis = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                count = [0, 0, 0, 0, 0, 0, 0]
                params = Object.assign(params, {
                    createdAt: {
                        $gte: new Date(startDate - 7 * 24 * 60 * 60 * 1000)
                    }
                })
                const result = await UserTeam.aggregate([{
                        $match: params
                    },
                    {
                        $group: {
                            _id: {
                                $dayOfWeek: '$createdAt',
                            },
                            count: {
                                $sum: 1,
                            },
                        },
                    }
                ]);
                for (let i = 0; i < result.length; i++) {
                    count[(result[i]._id) - 1] = result[i].count
                }
            } else if (type == 'monthly') {
                xAxis = [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December'
                ]
                count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                const currentDate = new Date();
                const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                params = Object.assign(params, {
                    createdAt: {
                        $lte: new Date()
                    }
                })
                const result = await UserTeam.aggregate([{
                        $match: params
                    },
                    {
                        $group: {
                            _id: {
                                $month: '$createdAt'
                            },
                            count: {
                                $sum: 1
                            },
                        },
                    },
                    {
                        $sort: {
                            '_id': 1 // Sort by date in ascending order
                        },
                    },
                ]);
                for (let i = 0; i < result.length; i++) {
                    count[(result[i]._id) - 1] = result[i].count
                }
            } else if (type == 'quarterly') {
                const currentDate = new Date();
                const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                xAxis = ['Q1', 'Q2', 'Q3', 'Q4']
                count = [0, 0, 0, 0]
                params = Object.assign(params, {
                    createdAt: {
                        $lte: new Date()
                    }
                })
                const result = await UserTeam.aggregate([{
                        $match: params
                    },
                    {
                        $group: {
                            _id: {
                                $subtract: [{
                                        $month: '$createdAt'
                                    },
                                    {
                                        $mod: [{
                                            $month: '$createdAt'
                                        }, 3]
                                    },
                                ],
                            },
                            count: {
                                $sum: 1
                            },
                        },
                    },
                    {
                        $sort: {
                            '_id': 1, // Sort by quarter in ascending order
                        },
                    }
                ]);
                for (let i = 0; i < result.length; i++) {
                    if (result[i]._id == 0) {
                        count[0] = result[i].count
                    } else if (result[i]._id == 3) {
                        count[1] = result[i].count
                    } else if (result[i]._id == 6) {
                        count[2] = result[i].count
                    } else {
                        count[3] = result[i].count
                    }
                }
            } else {
                params = Object.assign(params, {
                    createdAt: {
                        $lte: new Date()
                    }
                })
                const result = await UserTeam.aggregate([{
                        $match: params
                    },
                    {
                        $group: {
                            _id: {
                                year: {
                                    $year: '$createdAt'
                                },
                            },
                            count: {
                                $sum: 1
                            },
                        },
                    },
                    {
                        $sort: {
                            '_id.year': 1, // Sort by year in ascending order
                        },
                    },
                    {
                        $project: {
                            _id: 0, // Exclude the default MongoDB _id field
                            year: '$_id.year',
                            count: '$count',
                        },
                    },
                ]);

                for (let i = 0; i < result.length; i++) {
                    xAxis[i] = result[i].year
                    count[i] = result[i].count
                }
            }
            let data = {
                xAxis: xAxis,
                count: count,
            }
            return SendResponse(res, data, "Team graph data", 200);


        } catch (error) {
            dump(error);
            return SendResponse(
                res, {
                    isBoom: true
                },
                "Something wents wrong, please try again",
                500
            );
        }
    },
    getUserMapData: async (req, res) => {
        try {

            const result = await User.aggregate([{
                    $group: {
                        _id: {
                            country: '$country'
                        },
                        count: {
                            $sum: 1
                        },
                    },
                },
                {
                    $sort: {
                        '_id.country': 1,
                    },
                },
                {
                    $project: {
                        _id: 0, // Exclude the default MongoDB _id field
                        country: '$_id.country',
                        count: '$count',
                    },
                },

            ]);
            let markerData = [];
            const apiKey = 'AIzaSyBhQfK1UR3j7j2w8xwUO7WUNJ2cIYyCQvg';
            for (let i = 0; i < result.length; i++) {
                const countryName = 'United States'; // Replace with the desired country name

                const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(result[i].country)}&key=${apiKey}`;

                await axios.get(geocodingUrl)
                    .then(response => {
                        const data = response.data;
                        if (data.status === 'OK' && data.results.length > 0) {
                            const location = data.results[0].geometry.location;
                            const latitude = location.lat;
                            const longitude = location.lng;
                            markerData.push({
                                country: result[i].country,
                                count: result[i].count,
                                coordinates: {
                                    lat: latitude,
                                    lng: longitude
                                }
                            }, )
                        } else {
                            console.error('Geocoding failed. Check your API key and country name.');
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching geocoding data:', error.message);
                    });

            }

            let data = {
                markerData: markerData
            }
            return SendResponse(res, data, "User graph data", 200);


        } catch (error) {
            dump(error);
            return SendResponse(
                res, {
                    isBoom: true
                },
                "Something wents wrong, please try again",
                500
            );
        }
    },
    getRevenueGraph: async (req, res) => {
        try {
            // const v = new Validator(req.query, {
            //     startDate: "required",
            //     endDate: "required",

            // });
            // const CheckValidation = await v.check();
            // if (!CheckValidation) {
            //     let first_key = Object.keys(v.errors)[0];
            //     let err = v.errors[first_key]["message"];
            //     return SendResponse(res, {
            //         isBoom: true
            //     }, err, 422);
            // }
            let type = req.query.type ? req.query.type : 'weekly';
            let xAxis = [];
            let count = []
            let params = {
                isFundTransferred: true
            }
            if (req.query.sportId) {
                params = Object.assign(params, {
                    sportId: req.query.sportId
                })
            }
            if (type == 'weekly') {
                let startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
                let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
                xAxis = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                count = [0, 0, 0, 0, 0, 0, 0]
                params = Object.assign(params, {
                    createdAt: {
                        $gte: new Date(startDate - 7 * 24 * 60 * 60 * 1000)
                    }
                })
                const result = await TrainingBooking.aggregate([{
                        $match: params
                    },
                    {
                        $group: {
                            _id: {
                                $dayOfWeek: '$createdAt',
                            },
                            count: {
                                $sum: "$superAdminLocalCommission",
                            },
                        },
                    }
                ]);
                for (let i = 0; i < result.length; i++) {
                    count[(result[i]._id) - 1] = result[i].count
                }
            } else if (type == 'monthly') {
                xAxis = [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December'
                ]
                count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                const currentDate = new Date();
                const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                params = Object.assign(params, {
                    createdAt: {
                        $lte: new Date()
                    }
                })
                const result = await TrainingBooking.aggregate([{
                        $match: params
                    },
                    {
                        $group: {
                            _id: {
                                $month: '$createdAt'
                            },
                            count: {
                                $sum: "$superAdminLocalCommission"
                            },
                        },
                    },
                    {
                        $sort: {
                            '_id': 1 // Sort by date in ascending order
                        },
                    },
                ]);
                for (let i = 0; i < result.length; i++) {
                    count[(result[i]._id) - 1] = result[i].count
                }
            } else if (type == 'quarterly') {
                const currentDate = new Date();
                const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                xAxis = ['Q1', 'Q2', 'Q3', 'Q4']
                count = [0, 0, 0, 0]
                params = Object.assign(params, {
                    createdAt: {
                        $lte: new Date()
                    }
                })
                const result = await TrainingBooking.aggregate([{
                        $match: params
                    },
                    {
                        $group: {
                            _id: {
                                $subtract: [{
                                        $month: '$createdAt'
                                    },
                                    {
                                        $mod: [{
                                            $month: '$createdAt'
                                        }, 3]
                                    },
                                ],
                            },
                            count: {
                                $sum: "$superAdminLocalCommission"
                            },
                        },
                    },
                    {
                        $sort: {
                            '_id': 1, // Sort by quarter in ascending order
                        },
                    }
                ]);
                for (let i = 0; i < result.length; i++) {
                    if (result[i]._id == 0) {
                        count[0] = result[i].count
                    } else if (result[i]._id == 3) {
                        count[1] = result[i].count
                    } else if (result[i]._id == 6) {
                        count[2] = result[i].count
                    } else {
                        count[3] = result[i].count
                    }
                }
            } else {
                params = Object.assign(params, {
                    createdAt: {
                        $lte: new Date()
                    }
                })
                const result = await TrainingBooking.aggregate([{
                        $match: params
                    },
                    {
                        $group: {
                            _id: {
                                year: {
                                    $year: '$createdAt'
                                },
                            },
                            count: {
                                $sum: "$superAdminLocalCommission"
                            },
                        },
                    },
                    {
                        $sort: {
                            '_id.year': 1, // Sort by year in ascending order
                        },
                    },
                    {
                        $project: {
                            _id: 0, // Exclude the default MongoDB _id field
                            year: '$_id.year',
                            count: '$count',
                        },
                    },
                ]);

                for (let i = 0; i < result.length; i++) {
                    xAxis[i] = result[i].year
                    count[i] = result[i].count
                }
            }
            let data = {
                xAxis: xAxis,
                count: count,
            }
            return SendResponse(res, data, "Revenue graph data", 200);


        } catch (error) {
            dump(error);
            return SendResponse(
                res, {
                    isBoom: true
                },
                "Something wents wrong, please try again",
                500
            );
        }
    },

    getDashboardSummary: async (req,res) => {
        try{
            const usersData = await User.countDocuments();
            const teamsData = await UserTeam.countDocuments({ isDeleted : false, status : true });
            const eventsData = await UserEvent.countDocuments({status : true });
            const bookingsData = await TrainingBooking.countDocuments({isDeleted: false, status : true });
            return SendResponse(
                res, {
                   userCount : usersData, 
                   teamsCount : teamsData,
                   eventsCount : eventsData,
                   bookingsCount : bookingsData
                },
                "Dashboard Summary Data",
                
            );
            
        } catch (error) {
            dump(error);
            return SendResponse(
                res, {
                    isBoom: true
                },
                "Something wents wrong, please try again",
                500
            );
        }
    }
}