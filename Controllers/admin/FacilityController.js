const { Mongoose } = require("mongoose");
const Boom = require("boom");
const Facility = require("../../models/facility");
const FacilityBranch = require("../../models/facilityBranch");
const TrainingBooking = require("../../models/trainingBooking");
const Training = require("../../models/training");
const RatingReviews = require("../../models/ratingReview");
const User = require("../../models/user");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcrypt");
const moment = require("moment");
const { Validator } = require("node-input-validator");
const i18n = require("i18n");
const SendResponse = require("../.././apiHandler");
const {dump} = require("../../services/dump");
const XLSX = require("xlsx");
var fs = require("fs");
var path = require("path");

module.exports = {
  Facilitylist: async (req, res) => {
    try {
      let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;
      let params = {
        userType: "facility_admin",
        isDeleted: false,
      };
      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          name: {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }

      const [{ facilityList, total }] = await Facility.aggregate([
        {
          $match: params,
        },
        {
          $lookup: {
            from: "facilitybranches",
            let: { facilityId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$facilityId", "$$facilityId"] } } },
              {
                $group: {
                  _id: null,
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
            as: "facilityDetails",
          },
        },
        {
          $unwind: {
            path: "$facilityDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $facet: {
            total: [
              {
                $group: {
                  _id: "null",
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
            facilityList: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  createdAt: 1,
                  countryCode: 1,
                  mobile: 1,
                  address: 1,
                  country: 1,
                  state: 1,
                  city: 1,
                  pincode: 1,
                  coverImage: 1,
                  profileImage: 1,
                  status: 1,
                  userType: 1,
                  totalFacility: "$facilityDetails.count",
                  status: 1,
                },
              },
              {
                $sort: sort,
              },
              {
                $skip: skipIndex,
              },
              {
                $limit: limit,
              },
            ],
          },
        },
        {
          $addFields: {
            total: {
              $cond: {
                if: {
                  gt: [
                    {
                      $size: "$total",
                    },
                    0,
                  ],
                },
                then: {
                  $arrayElemAt: ["$total.count", 0],
                },
                else: 0,
              },
            },
          },
        },
      ]);
      let facilityData = {
        facilityList: facilityList,
        total: total || 0,
      };
      return SendResponse(
        res,
        {
          facilityData: facilityData,
        },
        "Facility list",
        200
      );
    } catch (err) {
      dump(err);
      SendResponse(
        res,
        { isBoom: true },
        "Something went wrong,please try again",
        500
      );
    }
  },

  //download Companies/Facilities list
  downloadFacilityList: async (req, res) => {
    try {
      let { order = "desc", sort = "createdAt" } = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };

      let params = {
        userType: "facility_admin",
        isDeleted: false,
      };
      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          name: {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }

      const facilityList = await Facility.aggregate([
        {
          $match: params,
        },
        {
          $project: {
            _id: 1,
            name: 1,
            createdAt: 1,
            countryCode: 1,
            mobile: 1,
            address: 1,
            country: 1,
            state: 1,
            city: 1,
            pincode: 1,
            coverImage: 1,
            profileImage: 1,
            companyId: 1,
            totalFacility: 1,
          },
        },
        {
          $sort: sort ,
        },
      ]);

      // set xls Column Name
      const workSheetColumnName = [
        "Sr. No.",
        "Company Id",
        "Company Name",
        "Email",
        "Mobile Number",
        "Company Address",
        "Total Facilities",
        "User Reviews",
        "Status",
      ];

      // set xls file Name
      const workSheetName = "user";

      // set xls file path
      const filePath = "public/files/" + "Facility Admins.xlsx";

      //get wanted params by mapping
      const result = facilityList.map((val, index) => {
        return [
          index + 1,
          val.companyId ? val.companyId : "",
          val.name,
          val.email,
          `${val.countryCode} ${val.mobile}`,
          val.address,
          val.totalFacility,
          "",
          val.status,
        ];
      });

      const workBook = await XLSX.utils.book_new(); //Create a new workbook
      const worksheetData = [workSheetColumnName, ...result];
      const worksheet = await XLSX.utils.aoa_to_sheet(worksheetData); //add data to sheet
      await XLSX.utils.book_append_sheet(workBook, worksheet, workSheetName); // add sheet to workbook

      await XLSX.writeFile(workBook, filePath);

      //download Concept
      setTimeout(async () => {
        await res.download(filePath);
        fs.access(filePath, (error) => {
          if (!error) {
            fs.unlinkSync(filePath, function (error) {
              dump(error);
            });
          } else {
            dump(error, "not error");
          }
        });
      }, 1000);
    } catch (error) {
      dump(error);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },

  FacilityAdminDetails: async (req, res) => {
    try {
      if (!req.params.id) {
        return SendResponse(
          res,
          { isBoom: true },
          "Facility Admin id is required",
          422
        );
      }

      let facilityAdmin = await Facility.findById(req.params.id);
      if (!facilityAdmin) {
        return SendResponse(
          res,
          { isBoom: true },
          "No facility admin found",
          422
        );
      }

      const [data] = await Facility.aggregate([
        {
          $match: { _id: ObjectId(req.params.id) },
        },
        {
          $lookup: {
            from: "facilitybranches",
            // localField: "_id",
            // foreignField: "facilityId",
            let: { facilityAdminId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$facilityId", "$$facilityAdminId"] },
                },
              },
              {
                 $lookup : {
                  from : "sports",
                  let : { sportsId : "$chosenSports" },
                  pipeline: [
                    {
                      $match : {
                        $expr : { $in : [ "$_id", "$$sportsId"] },
                      }
                    }
                  ],
                  as: "chosenSportsList"
                 }
              },
              {
                $lookup: {
                  from: "trainings",
                  let: { facilityBranchId: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$facilityId", "$$facilityBranchId"] },
                      },
                    },
                  ],
                  as: "trainings",
                },
              },
            ],
            as: "facilityBranchDetails",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            createdAt: 1,
            countryCode: 1,
            mobile: 1,
            address: 1,
            country: 1,
            email: 1,
            adminName: 1,
            state: 1,
            city: 1,
            pincode: 1,
            coverImage: 1,
            profileImage: 1,
            isEmailVerify: 1,
            facilityBranchDetails: 1,
            status: 1,
          },
        },
      ]);

      return SendResponse(
        res,
        { facilityAdmin: data },
        "Facility Admin Details",
        200
      );
    } catch (err) {
      dump(err);
      return SendResponse(
        res,
        { isBoom: true },
        "Something went wrong, please try again",
        500
      );
    }
  },

  FacilityBranchDetails: async (req, res) => {
    try {
      let facilityBranch = await FacilityBranch.findById(req.params.id);
      if (!facilityBranch) {
        return SendResponse(
          res,
          { isBoom: true },
          "No facility branch found",
          422
        );
      }

      let trainingParams = { 
        $expr: { $eq: ["$facilityId", "$$facilityId"] },
      };

      if (req.query.trainingSearch != "" && req.query.trainingSearch != null) {
        trainingParams = Object.assign(trainingParams, {
          trainingName: {
            $regex: ".*" + req.query.trainingSearch + ".*",
            $options: "i",
          },
        });
      }

      let bookingParams = { 
        $expr: { $eq: ["$facilityId", "$$facilityId"] },
      };

      if (req.query.bookingSearch != "" && req.query.bookingSearch != null) {
        bookingParams = Object.assign(bookingParams, {
           bookingId : Number(req.query.bookingSearch) 
        });
      }

      let paymentParams = { $expr: { $eq: ["$_id", "$$userId"] } };
      if (req.query.paymentSearch != "" && req.query.paymentSearch != null) {
        paymentParams = Object.assign(paymentParams, {
           "fullName" : {
            $regex: ".*" + req.query.paymentSearch + ".*",
            $options: "i",
          },
        });
      }

      const [data] = await FacilityBranch.aggregate([
        {
          $match: { _id: ObjectId(req.params.id) },
        },
        {
          $lookup: {
            from: "facilities",
            let: { facilityId: "$facilityId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$facilityId"] } } },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  createdAt: 1,
                  countryCode: 1,
                  mobile: 1,
                  address: 1,
                  country: 1,
                  state: 1,
                  city: 1,
                  pincode: 1,
                  coverImage: 1,
                  profileImage: 1,
                  status: 1,
                  userType: 1,
                  status: 1,
                },
              },
              {
                $lookup: {
                  from: "facilitybranches",
                  let: { facilityAdminId: "$$facilityId" },
                  pipeline: [
                    { $match: { $expr: { $eq: ["$facilityId", "$$facilityAdminId"] } } },
                    {
                      $group: {
                        _id: null,
                        count: {
                          $sum: 1,
                        },
                      },
                    },
                  ],
                  as: "facilityBranchCount"
                }
              },
            ],
            as: "facilityAdminDetails",
          },
        },
        {
          $unwind: {
            path: "$facilityAdminDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            countryAlphaCode: 1,
            countryCode: 1,
            mobile: 1,
            address: 1,
            country: 1,
            state: 1,
            city: 1,
            pincode: 1,
            coverImage: 1,
            location: 1,
            openingTime: 1,
            closingTime: 1,
            chosenSports: 1,
            facilityId: 1,
            isDeleted: 1,
            rating: 1,
            status: 1,
            isStripeAccountConnected: 1,
            facilityAdminDetails: "$facilityAdminDetails",
          },
        },
      ]);

      return SendResponse(
        res,
        { facilityBranch: data },
        "Facility Branch Details",
        200
      );
    } catch (err) {
      dump(err);
      return SendResponse(
        res,
        { isBoom: true },
        "Something went wrong, please try again",
        500
      );
    }
  },

  facilityBookingsList: async (req, res) =>{
    try{
      let facilityBranch = await FacilityBranch.findById(req.params.id);
      if (!facilityBranch) {
        return SendResponse(
          res,
          { isBoom: true },
          "No facility branch found",
          422
        );
      }

      let { limit = 10, order = "desc", sort } = req.query;
      let sortparam = { createdAt: -1 };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;
      let params = {
        facilityId : ObjectId(req.params.id)
      };
      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          bookingId : Number(req.query.search) 
        });
      }
      if (sort != "" && sort != null) {
        sortparam = sort == "asc" ? { createdAt: 1 } : { createdAt: -1 };
      }

      const [{ facilityBookingsList, total }] = await TrainingBooking.aggregate([
        {
          $match: params,
        },
        {
          $lookup : {
              from: 'sports',
              let: { sportId: "$sportId" },
              pipeline: [
              {
                $match: { $expr: { $eq: ["$_id", "$$sportId"] } },
              },
              ],
              as: 'sportDetails'
          }
        },
        {
          $unwind: {
              path: "$sportDetails",
              preserveNullAndEmptyArrays : true
            },
        },
        {
          $facet: {
            total: [
              {
                $group: {
                  _id: "null",
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
            facilityBookingsList: [
              {
                $project: {
                  _id: 1,
                  bookingId: 1,
                  bookingFor: 1,
                  userId: 1,
                  familyMember: 1,
                  trainingId: 1,
                  trainingCompleted: 1,
                  totalSession: 1,
                  totalAttendedSession: 1,
                  currentAttendancePercent: 1,
                  facilityAdminId: 1,
                  sportDetails: "$sportDetails",
                  facilityId: 1,
                  sportId: 1,
                  startDate: 1,
                  endDate: 1,
                  createdAt: 1,
                  days: 1,
                },
              },
              {
                $sort: sortparam,
              },
              {
                $skip: skipIndex,
              },
              {
                $limit: limit,
              },
            ],
          },
        },
        {
          $addFields: {
            total: {
              $cond: {
                if: {
                  gt: [
                    {
                      $size: "$total",
                    },
                    0,
                  ],
                },
                then: {
                  $arrayElemAt: ["$total.count", 0],
                },
                else: 0,
              },
            },
          },
        },
      ]);

      return SendResponse(
        res,
        {
          facilityBookingsList,
          facilityName : facilityBranch.name,
          total : total || 0
        },
        "Facility bookings list",
        200
      );
    }catch (err) {
      dump(err);
      return SendResponse(
        res,
        { isBoom: true },
        "Something wents wrong, please try again",
        500
      );
    }
  },

  facilityPaymentsList: async (req, res) =>{
    try{
      let facilityBranch = await FacilityBranch.findById(req.params.id);
      if (!facilityBranch) {
        return SendResponse(
          res,
          { isBoom: true },
          "No facility branch found",
          422
        );
      }

      let { limit = 10, order = "desc", sort } = req.query;
      let sortparam = { createdAt: -1 };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;
      let params = {
        $expr: { $eq: ["$_id", "$$userId"] } 
      };
      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          "fullName" : {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }
      if (sort != "" && sort != null) {
        sortparam = sort == "asc" ? { createdAt: 1 } : { createdAt: -1 };
      }

      const [{ facilityPaymentsList, total }] = await TrainingBooking.aggregate([
        {
          $lookup : {
             from: 'users',
             let: { userId: "$userId" },
             pipeline: [
              {
                $match: params,
              },
              {
                $project : {
                  _id : 1,
                  fullName : 1,
                  email : 1
                }
              }
             ],
             as: 'userDetails'
          }
        },
        {
          $unwind: {
              path: "$userDetails",
              preserveNullAndEmptyArrays : false
            },
        },
        {
          $match: { 
            facilityId : ObjectId(req.params.id),
            isFundTransferred: true
          },
        },
        {
          $facet: {
            total: [
              {
                $group: {
                  _id: "null",
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
            facilityPaymentsList: [
              {
                $project: {
                  _id: 1,
                  bookingId: 1,
                  bookingFor: 1,
                  userId: 1,
                  familyMember: 1,
                  trainingId: 1,
                  trainingCompleted: 1,
                  totalSession: 1,
                  totalAttendedSession: 1,
                  currentAttendancePercent: 1,
                  facilityAdminId: 1,
                  userDetails: "$userDetails",
                  facilityId: 1,
                  sportId: 1,
                  startDate: 1,
                  endDate: 1,
                  paymentId: 1,
                  totalPrice: 1,
                  facilityAdminLocalCommission: 1,
                  facilityAdminCommission: 1,
                  isFundTransferred: 1,
                  currency: 1,
                  createdAt: 1,
                  days: 1,
                },
              },
              {
                $sort: sortparam,
              },
              {
                $skip: skipIndex,
              },
              {
                $limit: limit,
              },
            ],
          },
        },
        {
          $addFields: {
            total: {
              $cond: {
                if: {
                  gt: [
                    {
                      $size: "$total",
                    },
                    0,
                  ],
                },
                then: {
                  $arrayElemAt: ["$total.count", 0],
                },
                else: 0,
              },
            },
          },
        },
      ]);

      return SendResponse(
        res,
        {
          facilityPaymentsList,
          total : total || 0
        },
        "Facility payments list",
        200
      );
    }catch (err) {
      dump(err);
      return SendResponse(
        res,
        { isBoom: true },
        "Something wents wrong, please try again",
        500
      );
    }
  },

  facilityTrainingsList: async (req, res) =>{
    try{
      let facilityBranch = await FacilityBranch.findById(req.params.id);
      if (!facilityBranch) {
        return SendResponse(
          res,
          { isBoom: true },
          "No facility branch found",
          422
        );
      }

      let { limit = 10, order = "desc", sort  } = req.query;
      let sortparam = { createdAt: -1 };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;
      let params = {
        facilityId : ObjectId(req.params.id)
      };
      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          trainingName: {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }
      if (sort != "" && sort != null) {
        sortparam = sort == "asc" ? { createdAt: 1 } : { createdAt: -1 };
      }
      const [{ facilityTrainingsList, total }] = await Training.aggregate([
        {
          $match: params,
        },
        {
          $lookup : {
              from: 'sports',
              let: { sportId: "$sportId" },
              pipeline: [
              {
                $match: { $expr: { $eq: ["$_id", "$$sportId"] } },
              },
              ],
              as: 'sportDetails'
          }
        },
        {
          $unwind: {
              path: "$sportDetails",
              preserveNullAndEmptyArrays : true
            },
        },
        {
          $lookup : {
            from : "facilities",
            let: {
                coachId: "$coachesId",
            },
            pipeline: [{
                $match: {
                $and: [{
                    $expr: {
                        $in: ["$_id", "$$coachId"],
                    },
                    },
                ],
                },
            },
            {
                $project: {
                _id: 1,
                name: 1,
                email: 1,
                profileImage: 1,
                coverImage: 1,
                about: 1,
                rating: 1,
                },
            },
            ],
            as: "coachDetails",
         },
        },
        {
          $facet: {
            total: [
              {
                $group: {
                  _id: "null",
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
            facilityTrainingsList: [
              {
                $project: {
                  _id: 1,
                  trainingName: 1,
                  address: 1,
                  facilityId: 1,
                  coverImage: 1,
                  location: 1,
                  startDate: 1,
                  endDate: 1,
                  days: 1,
                  createdAt: 1,
                  students: 1,
                  rating: 1,
                  sportDetails: "$sportDetails",
                  coachDetails: "$coachDetails"
                },
              },
              {
                $sort: sortparam,
              },
              {
                $skip: skipIndex,
              },
              {
                $limit: limit,
              },
            ],
          },
        },
        {
          $addFields: {
            total: {
              $cond: {
                if: {
                  gt: [
                    {
                      $size: "$total",
                    },
                    0,
                  ],
                },
                then: {
                  $arrayElemAt: ["$total.count", 0],
                },
                else: 0,
              },
            },
          },
        },
      ]);

      return SendResponse(
        res,
        {
          facilityTrainingsList,
          total : total || 0
        },
        "Facility trainings list",
        200
      );
    }catch (err) {
      dump(err);
      return SendResponse(
        res,
        { isBoom: true },
        "Something wents wrong, please try again",
        500
      );
    }
  },

  facilityReviewsList: async (req, res) =>{
    try{
      let facilityBranch = await FacilityBranch.findById(req.params.id);
      if (!facilityBranch) {
        return SendResponse(
          res,
          { isBoom: true },
          "No facility branch found",
          422
        );
      }

      let { limit = 10, order = "desc", sort } = req.query;
      let sortparam = { createdAt: -1 };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;
      let params = {
        ratingFor : "facility", 
        facilityId : ObjectId(req.params.id)
      };
      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          review: {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }

      if (sort != "" && sort != null) {
        sortparam = sort == "asc" ? { createdAt: 1 } : { createdAt: -1 };
      }

      const [{ facilityReviewsList, total }] = await RatingReviews.aggregate([
        {
          $match: params,
        },
        {
          $lookup : {
             from: 'users',
             let: { userId: "$userId" },
             pipeline: [
              {
                $match: { $expr: { $eq: ["$_id", "$$userId"] } },
              },
              {
                $project : {
                  _id : 1,
                  fullName : 1,
                  nickName : 1,
                  mobile : 1,
                  countryCode : 1,
                  phoneNumericCode : 1,
                  phoneCode : 1,
                  email : 1,
                  country : 1,
                  state  : 1,
                  city : 1,
                  status : 1,
                  profileImage : 1
                }
              }
             ],
             as: 'userDetails'
          }
        },
        {
          $unwind: {
              path: "$userDetails",
              preserveNullAndEmptyArrays : true
            },
        },
        {
          $facet: {
            total: [
              {
                $group: {
                  _id: "null",
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
            facilityReviewsList: [
              {
                $project: {
                  _id: 1,
                  facilityId: 1,
                  ratingFor: 1,
                  userId: 1,
                  rating: 1,
                  review: 1,
                  ratedOn: 1,
                  createdAt: 1,
                  userDetails: "$userDetails"
                },
              },
              {
                $sort: sortparam,
              },
              {
                $skip: skipIndex,
              },
              {
                $limit: limit,
              },
            ],
          },
        },
        {
          $addFields: {
            total: {
              $cond: {
                if: {
                  gt: [
                    {
                      $size: "$total",
                    },
                    0,
                  ],
                },
                then: {
                  $arrayElemAt: ["$total.count", 0],
                },
                else: 0,
              },
            },
          },
        },
      ]);

      return SendResponse(
        res,
        {
          facilityReviewsList,
          total : total || 0
        },
        "Facility reviews list",
        200
      );
    }catch (err) {
      dump(err);
      return SendResponse(
        res,
        { isBoom: true },
        "Something wents wrong, please try again",
        500
      );
    }
  },

  //download facility bookings list 
  downloadFacilityBookingsList: async (req, res) => {
    try {
      let { order = "desc", sort , status, search} = req.query;
      let sortparam = { createdAt: -1 };
      let facilityBranch = await FacilityBranch.findById(req.params.id);
      let params = {
        facilityId : ObjectId(req.params.id)
      };
      if (search != "" && search != null) {
        params = Object.assign(params, {
          bookingId : Number(search) 
        });
      }
      if (sort != "" && sort != null) {
        sortparam = sort == "asc" ? { createdAt: 1 } : { createdAt: -1 };
      }
      const facilityBookingsList = await TrainingBooking.aggregate([
        {
          $match: params,
        },
        {
          $lookup : {
              from: 'sports',
              let: { sportId: "$sportId" },
              pipeline: [
              {
                $match: { $expr: { $eq: ["$_id", "$$sportId"] } },
              },
              ],
              as: 'sportDetails'
          }
        },
        {
          $unwind: {
              path: "$sportDetails",
              preserveNullAndEmptyArrays : true
            },
        },
        {
          $project: {
            _id: 1,
            bookingId: 1,
            bookingFor: 1,
            userId: 1,
            familyMember: 1,
            trainingId: 1,
            trainingCompleted: 1,
            totalSession: 1,
            totalAttendedSession: 1,
            currentAttendancePercent: 1,
            facilityAdminId: 1,
            sportDetails: "$sportDetails",
            facilityId: 1,
            sportId: 1,
            startDate: 1,
            endDate: 1,
            createdAt: 1,
            days: 1,
          },
        },
        {
          $sort: sortparam ,
        },
      ]);

      // set xls Column Name
      const workSheetColumnName = [
        "Booking Id",
        "Facility Name",
        "Type of booking",
        "Event/Coaching Type",
        "Booking Date & Time",
        "Booking Status"
      ];

      // set xls file Name
      const workSheetName = "user";

      // set xls file path
      const filePath = "public/files/" + "FacilityBookings.xlsx";


      //get wanted params by mapping
      const result = facilityBookingsList.map((val, index) => {

        return [
          val.bookingId,
          facilityBranch.name,
          "Coaching/Training sessions",
          val.sportDetails.sports_name,
          new Date(val.createdAt),
          "Confirmed"
        ];
      });

      const workBook = await XLSX.utils.book_new(); //Create a new workbook
      const worksheetData = [workSheetColumnName, ...result];
      const worksheet = await XLSX.utils.aoa_to_sheet(worksheetData); //add data to sheet
      await XLSX.utils.book_append_sheet(workBook, worksheet, workSheetName); // add sheet to workbook

      await XLSX.writeFile(workBook, filePath);

      //download Concept
      setTimeout(async () => {
        await res.download(filePath);
        fs.access(filePath, (error) => {
          if (!error) {
            fs.unlinkSync(filePath, function (error) {
              dump(error);
            });
          } else {
            dump(error, "not error");
          }
        });
      }, 1000);
    } catch (error) {
      dump(error);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },

   //download facility payments list 
   downloadFacilityPaymentsList: async (req, res) => {
    try {
      let { order = "desc", sort , status, search} = req.query;
      let sortparam = { createdAt: -1 };
      let facilityBranch = await FacilityBranch.findById(req.params.id);
      let params = {
        $expr: { $eq: ["$_id", "$$userId"] } 
      };
      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          "fullName" : {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }
      if (sort != "" && sort != null) {
        sortparam = sort == "asc" ? { createdAt: 1 } : { createdAt: -1 };
      }

      const facilityPaymentsList = await TrainingBooking.aggregate([
        {
          $lookup : {
             from: 'users',
             let: { userId: "$userId" },
             pipeline: [
              {
                $match: params,
              },
              {
                $project : {
                  _id : 1,
                  fullName : 1,
                  email : 1
                }
              }
             ],
             as: 'userDetails'
          }
        },
        {
          $unwind: {
              path: "$userDetails",
              preserveNullAndEmptyArrays : false
            },
        },
        {
          $match: { 
            facilityId : ObjectId(req.params.id),
            isFundTransferred : true
          },
        },
        {
          $project: {
            _id: 1,
            bookingId: 1,
            bookingFor: 1,
            userId: 1,
            familyMember: 1,
            trainingId: 1,
            trainingCompleted: 1,
            totalSession: 1,
            totalAttendedSession: 1,
            currentAttendancePercent: 1,
            facilityAdminId: 1,
            userDetails: "$userDetails",
            facilityId: 1,
            sportId: 1,
            startDate: 1,
            endDate: 1,
            paymentId: 1,
            totalPrice: 1,
            facilityAdminLocalCommission: 1,
            facilityAdminCommission: 1,
            isFundTransferred: 1,
            currency: 1,
            createdAt: 1,
            days: 1,
          },
        },
        {
          $sort: sortparam ,
        },
      ]);

      // set xls Column Name
      const workSheetColumnName = [
        "Payment Id",
        "Payment Type",
        "User Detail",
        "Payment Date & Time",
        "Total Amount",
        "Commission Amount",
        "Payment Status"
      ];

      // set xls file Name
      const workSheetName = "user";

      // set xls file path
      const filePath = "public/files/" + "FacilityPayments.xlsx";


      //get wanted params by mapping
      const result = facilityPaymentsList.map((val, index) => {

        return [
          val.paymentId,
          "Card",
          val.userDetails.fullName,
          new Date(val.createdAt),
          `${val.totalPrice} ${val.currency}`,
          `${val.facilityAdminCommission} ${val.currency}`,
          "Done"
        ];
      });

      const workBook = await XLSX.utils.book_new(); //Create a new workbook
      const worksheetData = [workSheetColumnName, ...result];
      const worksheet = await XLSX.utils.aoa_to_sheet(worksheetData); //add data to sheet
      await XLSX.utils.book_append_sheet(workBook, worksheet, workSheetName); // add sheet to workbook

      await XLSX.writeFile(workBook, filePath);

      //download Concept
      setTimeout(async () => {
        await res.download(filePath);
        fs.access(filePath, (error) => {
          if (!error) {
            fs.unlinkSync(filePath, function (error) {
              dump(error);
            });
          } else {
            dump(error, "not error");
          }
        });
      }, 1000);
    } catch (error) {
      dump(error);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },

  //download facility trainings list 
  downloadFacilityTrainingsList: async (req, res) => {
    try {
      let { order = "desc", sort , status, search} = req.query;
      let sortparam = { createdAt: -1 };
      let facilityBranch = await FacilityBranch.findById(req.params.id);
      let params = {
        facilityId : ObjectId(req.params.id)
      };
      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          trainingName: {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }
      if (sort != "" && sort != null) {
        sortparam = sort == "asc" ? { createdAt: 1 } : { createdAt: -1 };
      }

      const facilityTrainingsList = await Training.aggregate([
        {
          $match: params,
        },
        {
          $lookup : {
              from: 'sports',
              let: { sportId: "$sportId" },
              pipeline: [
              {
                $match: { $expr: { $eq: ["$_id", "$$sportId"] } },
              },
              ],
              as: 'sportDetails'
          }
        },
        {
          $unwind: {
              path: "$sportDetails",
              preserveNullAndEmptyArrays : true
            },
        },
        {
          $lookup : {
            from : "facilities",
            let: {
                coachId: "$coachesId",
            },
            pipeline: [{
                $match: {
                $and: [{
                    $expr: {
                        $in: ["$_id", "$$coachId"],
                    },
                    },
                ],
                },
            },
            {
                $project: {
                _id: 1,
                name: 1,
                email: 1,
                profileImage: 1,
                coverImage: 1,
                about: 1,
                rating: 1,
                },
            },
            ],
            as: "coachDetails",
         },
        },
        {
          $project: {
            _id: 1,
            trainingName: 1,
            address: 1,
            facilityId: 1,
            coverImage: 1,
            location: 1,
            startDate: 1,
            endDate: 1,
            days: 1,
            createdAt: 1,
            students: 1,
            rating: 1,
            sportDetails: "$sportDetails",
            coachDetails: "$coachDetails"
          },
        },
        {
          $sort: sortparam ,
        },
      ]);

      // set xls Column Name
      const workSheetColumnName = [
        "Sr.no.",
        "Name of training",
        "Type of training",
        "Training Duration",
        "Training Start Date",
        "Training End Date",
        "Enrolled Attendees",
        "Coach",
        "Status"
      ];

      // set xls file Name
      const workSheetName = "user";

      // set xls file path
      const filePath = "public/files/" + "FacilityTrainings.xlsx";
      const currentDate = new Date();

      //get wanted params by mapping
      const result = facilityTrainingsList.map((val, index) => {
        const date1 = new Date(val.startDate);
        const date2 = new Date(val.endDate);
   
        // Difference in months
        const differenceInMonths = (date2.getMonth() - date1.getMonth()) + (12 * (date2.getFullYear() - date1.getFullYear()));
        val.trainingDuration = differenceInMonths;

        if( date1 > currentDate){
          val.trainingStatus = 'Upcoming'
        }

        if( date1 < currentDate && date2 > currentDate){
          val.trainingStatus = 'In Progress'
        }

        if( date2 < currentDate ){
          val.trainingStatus = 'Completed'
        }

        val.coaches = [];
        val?.coachDetails.forEach( ele => {
          val.coaches.push( ele.name);
        });
        val.coaches = val.coaches.join(", ");

        return [
          index + 1,
          val.trainingName,
          val.sportDetails.sports_name,
          val.trainingDuration + '' + ( val.trainingDuration > 1 ? 'months' : 'month'),
          new Date(val.startDate),
          new Date(val.endDate),
          val.students,
          val.coaches,
          val.trainingStatus
        ];
      });

      const workBook = await XLSX.utils.book_new(); //Create a new workbook
      const worksheetData = [workSheetColumnName, ...result];
      const worksheet = await XLSX.utils.aoa_to_sheet(worksheetData); //add data to sheet
      await XLSX.utils.book_append_sheet(workBook, worksheet, workSheetName); // add sheet to workbook

      await XLSX.writeFile(workBook, filePath);

      //download Concept
      setTimeout(async () => {
        await res.download(filePath);
        fs.access(filePath, (error) => {
          if (!error) {
            fs.unlinkSync(filePath, function (error) {
              dump(error);
            });
          } else {
            dump(error, "not error");
          }
        });
      }, 1000);
    } catch (error) {
      dump(error);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },



  //********Change Status Of Facility Admin / Coach********** */
  UpdateStatus: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        id: "required",
        status: "required",
      });
      const CheckValidation = await v.check();
      if (!CheckValidation) {
        let first_key = Object.keys(v.errors)[0];
        let err = v.errors[first_key]["message"];
        return SendResponse(res, { isBoom: true }, err, 422);
      }
      const user = await FacilityBranch.findByIdAndUpdate(
        req.body.id,
        {
          $set: { status: req.body.status },
        },
        { new: true }
      );
      return SendResponse(res, {}, "Status changed successfully", 200);
    } catch (err) {
      dump(err);
      return SendResponse(
        res,
        { isBoom: true },
        "Something wents wrong, please try again",
        500
      );
    }
  },

  CoachList: async (req, res) => {
    try {
      let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;
      let params = {
        userType: "coach",
        isDeleted: false,
      };
      if( req.query.facilityAdminId != "" && req.query.facilityAdminId != null ) {
        params = Object.assign(params, {
          $expr : 
          {
              $in: [ ObjectId(req.query.facilityAdminId), "$facilityAdminId" ],
          },
        });
      }
      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          $or: [
            {
              name: {
                $regex: ".*" + req.query.search + ".*",
                $options: "i",
              },
            },
            {
              email: { $regex: ".*" + req.query.search + ".*", $options: "i" },
            },
            {
              mobile: { $regex: ".*" + req.query.search + ".*", $options: "i" },
            },
          ],
        });
      }

      const [{ coachList, total }] = await Facility.aggregate([
        {
          $match: params,
        },
        {
          $lookup: {
            from: "sports",
            localField: "chosenSports",
            foreignField: "_id",
            as: "coachSports",
          },
        },
        {
          $lookup: {
            from: "trainings",
            let: { coachId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$$coachId", "$coachesId"],
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
            as: "trainingDetails",
          },
        },
        {
          $unwind: {
            path: "$trainingDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $facet: {
            total: [
              {
                $group: {
                  _id: "null",
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
            coachList: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  createdAt: 1,
                  countryCode: 1,
                  mobile: 1,
                  address: 1,
                  country: 1,
                  state: 1,
                  city: 1,
                  pincode: 1,
                  coverImage: 1,
                  profileImage: 1,
                  chosenSports: 1,
                  coachSports : "$coachSports",
                  facilityAdmins : "$facilityAdmins",
                  status: 1,
                  userType: 1,
                  totalTrainings: "$trainingDetails.count",
                  status: 1,
                },
              },
              {
                $sort: sort,
              },
              {
                $skip: skipIndex,
              },
              {
                $limit: limit,
              },
            ],
          },
        },
        {
          $addFields: {
            total: {
              $cond: {
                if: {
                  gt: [
                    {
                      $size: "$total",
                    },
                    0,
                  ],
                },
                then: {
                  $arrayElemAt: ["$total.count", 0],
                },
                else: 0,
              },
            },
          },
        },
      ]);
      let coachData = {
        coachList: coachList,
        total: total || 0,
      };
      return SendResponse(
        res,
        {
          coachData: coachData,
        },
        "Coach list",
        200
      );
    } catch (err) {
      dump(err);
      SendResponse(
        res,
        { isBoom: true },
        "Something went wrong,please try again",
        500
      );
    }
  },

  //download coaches list 
  downloadCoachList: async (req, res) => {
    try {
      let { order = "desc", sort = "createdAt" , status, search} = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };

      let params = {
        userType: "coach",
        isDeleted: false,
      };

      if (search != "" && search != null) {
        params = Object.assign(params, {
          $or: [
            {
              name: {
                $regex: ".*" + search + ".*",
                $options: "i",
              },
            },
            {
              email: { $regex: ".*" + search + ".*", $options: "i" },
            },
            {
              mobile: { $regex: ".*" + search + ".*", $options: "i" },
            },
          ],
        });
      }


      const coachList = await Facility.aggregate([
        {
          $match: params,
        },
        {
          $lookup: {
            from: "sports",
            localField: "chosenSports",
            foreignField: "_id",
            as: "coachSports",
          },
        },
        {
          $lookup: {
            from: "trainings",
            let: { coachId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$$coachId", "$coachesId"],
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
            as: "trainingDetails",
          },
        },
        {
          $unwind: {
            path: "$trainingDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            createdAt: 1,
            countryCode: 1,
            mobile: 1,
            address: 1,
            country: 1,
            state: 1,
            city: 1,
            pincode: 1,
            coverImage: 1,
            profileImage: 1,
            chosenSports: 1,
            coachSports : "$coachSports",
            status: 1,
            userType: 1,
            totalTrainings: "$trainingDetails.count",
            status: 1,
          },
        },
        {
          $sort: sort ,
        },
      ]);

      // set xls Column Name
      const workSheetColumnName = [
        "Sr. No.",
        "Coach Name",
        "Coach Email",
        "Coach Mobile",
        "Coach Country",
        "Coach State",
        "Coach City",
        "Coach Sports Type",
        "No of Trainings",
        "Status"
      ];

      // set xls file Name
      const workSheetName = "user";

      // set xls file path
      const filePath = "public/files/" + "Coach.xlsx";


      //get wanted params by mapping
      const result = coachList.map((val, index) => {
        val.sports = [];
        val?.coachSports.forEach( ele => {
          val.sports.push( ele.sports_name);
        });
        val.sports = val.sports.join(", ");

        return [
          index + 1,
          val.name,
          val.email,
          val.mobile,
          val.country != null ? val.country : '',
          val.state != null ? val.state : '',
          val.city != null ? val.city : '',
          val.sports,
          val.totalTrainings,
          val.status == true ? 'Active' : 'Iactive'
        ];
      });

      const workBook = await XLSX.utils.book_new(); //Create a new workbook
      const worksheetData = [workSheetColumnName, ...result];
      const worksheet = await XLSX.utils.aoa_to_sheet(worksheetData); //add data to sheet
      await XLSX.utils.book_append_sheet(workBook, worksheet, workSheetName); // add sheet to workbook

      await XLSX.writeFile(workBook, filePath);

      //download Concept
      setTimeout(async () => {
        await res.download(filePath);
        fs.access(filePath, (error) => {
          if (!error) {
            fs.unlinkSync(filePath, function (error) {
              dump(error);
            });
          } else {
            dump(error, "not error");
          }
        });
      }, 1000);
    } catch (error) {
      dump(error);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },

  CoachDetails: async (req, res) => {
    try {
      let coach = await Facility.findById(req.params.id);
      if (!coach) {
        return SendResponse(res, { isBoom: true }, "No coach found", 422);
      }

      const [data] = await Facility.aggregate([
        {
          $match: { _id: ObjectId(req.params.id) },
        },
        {
          $lookup: {
            from: "trainings",
            let: { coachId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$$coachId", "$coachesId"],
                  },
                },
              },
              {
                $lookup : {
                  from : "sports",
                  let: { sportId : "$sportId"},
                  pipeline: [
                    { $match : { $expr : { $eq : ["$_id", "$$sportId"]}}}
                  ],
                  as : "sportDetails"
                }
              },
              {
                $unwind : "$sportDetails"
              },
              {
                $project : {
                  _id : 1,
                  trainingName : 1,
                  address: 1,
                  coverImage: 1,
                  startDate: 1,
                  endDate: 1,
                  createdAt: 1,
                  students: 1,
                  sportDetails: "$sportDetails",
                  sportId : 1,
                  status : 1
                }
              }
            ],
            as: "trainingList",
          },
        },
        {
          $lookup: {
            from: "facilities",
            let : { facilityAdminId : "$facilityAdminId" },
            pipeline : [
              { $match : { $expr : { $in : [ "$_id", "$$facilityAdminId" ] }} },
              { $project : {
                  _id: 1,
                  name: 1,
                  email: 1,
                  createdAt: 1,
                  countryCode: 1,
                  mobile: 1,
                  address: 1,
                  country: 1,
                  state: 1,
                  city: 1,
                  pincode: 1,
                  coverImage: 1,
                  profileImage: 1,
                  status: 1,
                  userType: 1,
                  about: 1,
                  status: 1,
                }
              }
            ],
            // localField: "facilityAdminId",
            // foreignField: "_id",
            as: "facilityAdmins",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            createdAt: 1,
            countryCode: 1,
            mobile: 1,
            address: 1,
            country: 1,
            state: 1,
            city: 1,
            pincode: 1,
            coverImage: 1,
            profileImage: 1,
            status: 1,
            userType: 1,
            about: 1,
            trainingsList: "$trainingList",
            facilityAdmins: "$facilityAdmins",
            status: 1,
          },
        },
      ]);

      return SendResponse(res, { CoachDetails: data }, "Coach Details", 200);
    } catch (err) {
      dump(err);
      return SendResponse(
        res,
        { isBoom: true },
        "Something went wrong, please try again",
        500
      );
    }
  },

  CoachFacilityAdmins: async(req,res) => {
    try{
      let coach = await Facility.findById(req.params.id);
      if (!coach) {
        return SendResponse(res, { isBoom: true }, "No coach found", 422);
      }
      let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;
      let params = { _id : { $in : coach.facilityAdminId }} ;
      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          "name": {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }

     
      const [{ facilityAdminsList, total }] = await Facility.aggregate([
        {
          $match: params,
        },
        {
          $facet: {
            total: [
              {
                $group: {
                  _id: "null",
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
            facilityAdminsList: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  createdAt: 1,
                  countryCode: 1,
                  mobile: 1,
                  address: 1,
                  country: 1,
                  state: 1,
                  city: 1,
                  pincode: 1,
                  coverImage: 1,
                  profileImage: 1,
                  status: 1,
                  userType: 1,
                  about: 1,
                  status: 1,
                },
              },
              {
                $sort: sort,
              },
              {
                $skip: skipIndex,
              },
              {
                $limit: limit,
              },
            ],
          },
        },
        {
          $addFields: {
            total: {
              $cond: {
                if: {
                  gt: [
                    {
                      $size: "$total",
                    },
                    0,
                  ],
                },
                then: {
                  $arrayElemAt: ["$total.count", 0],
                },
                else: 0,
              },
            },
          },
        },
      ]);

      return SendResponse(
        res,
        {
          facilityAdminsList,
          total : total || 0
        },
        "Facility admins list",
        200
      );

    }catch (err) {
      dump(err);
      return SendResponse(
        res,
        { isBoom: true },
        "Something went wrong, please try again",
        500
      );
    }
  },

  //download Coaches Facility Admins list
  downloadCoachFacilityAdminsList: async (req, res) => {
    try {
      let coach = await Facility.findById(req.params.id);
      if (!coach) {
        return SendResponse(res, { isBoom: true }, "No coach found", 422);
      }
      let params = { _id : { $in : coach.facilityAdminId }} ;
      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          "name": {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        }); 
      }
      const facilityAdminsList = await Facility.aggregate([
        {
          $match: params,
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            createdAt: 1,
            countryCode: 1,
            mobile: 1,
            address: 1,
            country: 1,
            state: 1,
            city: 1,
            pincode: 1,
            coverImage: 1,
            profileImage: 1,
            status: 1,
            userType: 1,
            about: 1,
            status: 1,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      // set xls Column Name
      const workSheetColumnName = [
        "Sr. No.",
        "Name",
        "Email",
        "Mobile No."
      ];

      // set xls file Name
      const workSheetName = "user";

      // set xls file path
      const filePath = "public/files/" + "Coach Facility Admins.xlsx";

      //get wanted params by mapping
      const result = facilityAdminsList.map((val, index) => {
        return [
          index + 1,
          val.name,
          val.email,
          `${val.countryCode != null ? (val.countryCode != "" ? (val.countryCode != "null" ? val.countryCode : '') : '') : ''} ${val.mobile}`
        ];
      });

      const workBook = await XLSX.utils.book_new(); //Create a new workbook
      const worksheetData = [workSheetColumnName, ...result];
      const worksheet = await XLSX.utils.aoa_to_sheet(worksheetData); //add data to sheet
      await XLSX.utils.book_append_sheet(workBook, worksheet, workSheetName); // add sheet to workbook

      await XLSX.writeFile(workBook, filePath);

      //download Concept
      setTimeout(async () => {
        await res.download(filePath);
        fs.access(filePath, (error) => {
          if (!error) {
            fs.unlinkSync(filePath, function (error) {
              dump(error);
            });
          } else {
            dump(error, "not error");
          }
        });
      }, 1000);
    } catch (error) {
      dump(error);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },

  coachTrainings: async(req,res) => {
    try{
      let coach = await Facility.findById(req.params.id);
      if (!coach) {
        return SendResponse(res, { isBoom: true }, "No coach found", 422);
      }
      let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;
      let params = {
        coachesId : { $in : [ObjectId(req.params.id)]}
      };
      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          "trainingName": {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }

      const [{ coachTrainingsList, total }] = await Training.aggregate([
        {
          $match: params,
        },
        {
          $lookup : {
            from : 'sports',
            localField : 'sportId',
            foreignField : '_id',
            as : 'sportDetails'
          }
        },
        {
          $unwind : {
            path : '$sportDetails',
            preserveNullAndEmptyArrays : true
          }
        },
        {
          $facet: {
            total: [
              {
                $group: {
                  _id: "null",
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
            coachTrainingsList: [
              {
                $project: {
                  _id : 1,
                  trainingName : 1,
                  address: 1,
                  coverImage: 1,
                  startDate: 1,
                  endDate: 1,
                  createdAt: 1,
                  students: 1,
                  sportDetails: "$sportDetails",
                  sportId : 1,
                  coachesId : 1,
                  status : 1
                },
              },
              {
                $sort: sort,
              },
              {
                $skip: skipIndex,
              },
              {
                $limit: limit,
              },
            ],
          },
        },
        {
          $addFields: {
            total: {
              $cond: {
                if: {
                  gt: [
                    {
                      $size: "$total",
                    },
                    0,
                  ],
                },
                then: {
                  $arrayElemAt: ["$total.count", 0],
                },
                else: 0,
              },
            },
          },
        },
      ]);

      return SendResponse(
        res,
        {
          coachTrainingsList,
          total : total || 0
        },
        "Coach trainings list",
        200
      );

    }catch (err) {
      dump(err);
      return SendResponse(
        res,
        { isBoom: true },
        "Something went wrong, please try again",
        500
      );
    }
  },

  //download Coaches Trainings list
  downloadCoachTrainingsList: async (req, res) => {
    try {
      let params = {
        coachesId : { $in : [ObjectId(req.params.id)]}
      };
      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          "trainingName": {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }
      const coachTrainingList = await Training.aggregate([
        {
          $match: params,
        },
        {
          $lookup : {
            from : 'sports',
            localField : 'sportId',
            foreignField : '_id',
            as : 'sportDetails'
          }
        },
        {
          $unwind : {
            path : '$sportDetails',
            preserveNullAndEmptyArrays : true
          }
        },
        {
          $project: {
            _id : 1,
            trainingName : 1,
            address: 1,
            coverImage: 1,
            startDate: 1,
            endDate: 1,
            createdAt: 1,
            students: 1,
            sportDetails: "$sportDetails",
            sportId : 1,
            coachesId : 1,
            status : 1
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      // set xls Column Name
      const workSheetColumnName = [
        "Sr. No.",
        "Name of Training",
        "Type of Training",
        "Training Duration",
        "Training Start Date",
        "Training End Date",
        "Enrolled Attendees",
        "Status",
      ];

      // set xls file Name
      const workSheetName = "user";

      // set xls file path
      const filePath = "public/files/" + "Coach Trainings.xlsx";

      //get wanted params by mapping
      const result = coachTrainingList.map((val, index) => {
        return [
          index + 1,
          val.trainingName,
          val.sportDetails.sports_name,
          `${((new Date(val.endDate)).getMonth() - (new Date(val.startDate)).getMonth()) + (12 * ((new Date(val.endDate)).getFullYear() - (new Date(val.startDate)).getFullYear()))} months`,
          val.startDate,
          val.endDate,
          val.students,
          val.status == true ? "Active" : "InActive",
        ];
      });

      const workBook = await XLSX.utils.book_new(); //Create a new workbook
      const worksheetData = [workSheetColumnName, ...result];
      const worksheet = await XLSX.utils.aoa_to_sheet(worksheetData); //add data to sheet
      await XLSX.utils.book_append_sheet(workBook, worksheet, workSheetName); // add sheet to workbook

      await XLSX.writeFile(workBook, filePath);

      //download Concept
      setTimeout(async () => {
        await res.download(filePath);
        fs.access(filePath, (error) => {
          if (!error) {
            fs.unlinkSync(filePath, function (error) {
              dump(error);
            });
          } else {
            dump(error, "not error");
          }
        });
      }, 1000);
    } catch (error) {
      dump(error);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },

  coachReviews: async(req,res) => {
    try{
      let coach = await Facility.findById(req.params.id);
      if (!coach) {
        return SendResponse(res, { isBoom: true }, "No coach found", 422);
      }
      let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;
      let params = {
        ratingFor : "coach",
        coachId : ObjectId(req.params.id)
      };
      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          "review": {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }

      const [{ coachReviewsList, total }] = await RatingReviews.aggregate([
        {
          $match: { _id : ObjectId(req.params.id)},
        },
        {
          $lookup : {
             from: 'users',
             let: { userId: "$userId" },
             pipeline: [
              {
                $match: { $expr: { $eq: ["$_id", "$$userId"] } },
              },
              {
                $project : {
                  _id : 1,
                  fullName : 1,
                  nickName : 1,
                  mobile : 1,
                  countryCode : 1,
                  phoneNumericCode : 1,
                  phoneCode : 1,
                  email : 1,
                  country : 1,
                  state  : 1,
                  city : 1,
                  status : 1,
                  profileImage : 1
                }
              }
             ],
             as: 'userDetails'
          }
        },
        {
          $unwind: {
              path: "$userDetails",
              preserveNullAndEmptyArrays : true
            },
        },
        {
          $facet: {
            total: [
              {
                $group: {
                  _id: "null",
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
            coachReviewsList: [
              {
                $project: {
                  _id : 1,
                  ratingFor : 1,
                  userId: 1,
                  coachId: 1,
                  rating: 1,
                  review: 1,
                  ratedOn: 1,
                  userDetails: "$userDetails",
                  status : 1
                },
              },
              {
                $sort: sort,
              },
              {
                $skip: skipIndex,
              },
              {
                $limit: limit,
              },
            ],
          },
        },
        {
          $addFields: {
            total: {
              $cond: {
                if: {
                  gt: [
                    {
                      $size: "$total",
                    },
                    0,
                  ],
                },
                then: {
                  $arrayElemAt: ["$total.count", 0],
                },
                else: 0,
              },
            },
          },
        },
      ]);

      return SendResponse(
        res,
        {
          coachReviewsList,
          total : total || 0
        },
        "Coach reviews list",
        200
      );

    }catch (err) {
      dump(err);
      return SendResponse(
        res,
        { isBoom: true },
        "Something went wrong, please try again",
        500
      );
    }
  },

  EditFacility: async( req, res)=>{
    try{
      const coach = await Facility.findOne({ _id: ObjectId(req.params.id) });
      if(!coach){
        return SendResponse(
          res,
          { isBoom: true },
          "Facility not found",
          422
        );
      }
      
      if( req.body.mobile && req.body.countryCode ){
        let checkMobileExits = await Facility.findOne({
          _id: { $ne: ObjectId(req.body.id) },
          mobile: req.body.mobile,
          countryCode: req.body.countryCode,
        });
        if (checkMobileExits) {
          return SendResponse(
            res,
            { isBoom: true },
            "This mobile number already exists",
            422
          );
        }
      }
      
      await Facility.findByIdAndUpdate( req.params.id, req.body);
      return SendResponse(res, {}, "Facility updated successfully", 200);
    }catch (err){
      dump(err);
      return SendResponse(
        res,
        { isBoom: true },
        "Something went wrong, please try again",
        500
      );
    }
  },

  FacilityBranchList: async (req, res) => {
    try {
      let { limit = 10, order = "desc", sort = "createdAt" } = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };
      limit = parseInt(limit);
      page = req.query.page ? parseInt(req.query.page) : 1;
      var skipIndex = (page - 1) * limit;
      let params = {
        isDeleted: false,
      };
      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          name: {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }

      const [{ facilityList, total }] = await FacilityBranch.aggregate([
        {
          $match: params,
        },
        {
          $facet: {
            total: [
              {
                $group: {
                  _id: "null",
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
            facilityList: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  countryAlphaCode: 1,
                  countryCode: 1,
                  mobile: 1,
                  address: 1,
                  country: 1,
                  state: 1,
                  city: 1,
                  pincode: 1,
                  coverImage: 1,
                  location: 1,
                  openingTime: 1,
                  closingTime: 1,
                  chosenSports: 1,
                  facilityId: 1,
                  isDeleted: 1,
                  rating: 1,
                  status: 1,
                  isStripeAccountConnected: 1,
                  createdAt: 1
                },
              },
              {
                $sort: sort,
              },
              {
                $skip: skipIndex,
              },
              {
                $limit: limit,
              },
            ],
          },
        },
        {
          $addFields: {
            total: {
              $cond: {
                if: {
                  gt: [
                    {
                      $size: "$total",
                    },
                    0,
                  ],
                },
                then: {
                  $arrayElemAt: ["$total.count", 0],
                },
                else: 0,
              },
            },
          },
        },
      ]);
      let facilityData = {
        facilityList: facilityList,
        total: total || 0,
      };
      return SendResponse(
        res,
        {
          facilityData: facilityData,
        },
        "Facility list",
        200
      );
    } catch (err) {
      dump(err);
      SendResponse(
        res,
        { isBoom: true },
        "Something went wrong,please try again",
        500
      );
    }
  },

  //download Facility Branches list
  downloadFacilityBranchList: async (req, res) => {
    try {
      let { order = "desc", sort = "createdAt" } = req.query;
      sort = {
        [sort]: order == "desc" ? -1 : 1,
      };

      let params = {
        isDeleted: false,
      };
      if (req.query.search != "" && req.query.search != null) {
        params = Object.assign(params, {
          name: {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
          },
        });
      }

      const facilityBranchList = await FacilityBranch.aggregate([
        {
          $match: params,
        },
        {
          $project: {
            _id: 1,
            name: 1,
            countryAlphaCode: 1,
            countryCode: 1,
            mobile: 1,
            address: 1,
            country: 1,
            state: 1,
            city: 1,
            pincode: 1,
            coverImage: 1,
            location: 1,
            openingTime: 1,
            closingTime: 1,
            chosenSports: 1,
            facilityId: 1,
            isDeleted: 1,
            rating: 1,
            status: 1,
            isStripeAccountConnected: 1
          },
        },
        {
          $sort: sort ,
        },
      ]);

      // set xls Column Name
      const workSheetColumnName = [
        "Sr. No.",
        "Facility Name",
        "Mobile Number",
        "Facility Address",
        "User Reviews",
        "Status",
      ];

      // set xls file Name
      const workSheetName = "user";

      // set xls file path
      const filePath = "public/files/" + "Facility.xlsx";

      //get wanted params by mapping
      const result = facilityBranchList.map((val, index) => {
        return [
          index + 1,
          val.name,
          `${val.countryCode != null ? (val.countryCode != "null" ? val.countryCode : '') : ''} ${val.mobile}`,
          val.address,
          val.rating,
          val.status == 1 ? 'Active' : 'Inactive',
        ];
      });

      const workBook = await XLSX.utils.book_new(); //Create a new workbook
      const worksheetData = [workSheetColumnName, ...result];
      const worksheet = await XLSX.utils.aoa_to_sheet(worksheetData); //add data to sheet
      await XLSX.utils.book_append_sheet(workBook, worksheet, workSheetName); // add sheet to workbook

      await XLSX.writeFile(workBook, filePath);

      //download Concept
      setTimeout(async () => {
        await res.download(filePath);
        fs.access(filePath, (error) => {
          if (!error) {
            fs.unlinkSync(filePath, function (error) {
              dump(error);
            });
          } else {
            dump(error, "not error");
          }
        });
      }, 1000)
    } catch (error) {
      dump(error);
      return SendResponse(
        res,
        {
          isBoom: true,
        },
        "Something went wrong,please try again",
        500
      );
    }
  },
};
