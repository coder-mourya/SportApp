const express = require("express");
const router = express.Router();
const PromotionController = require('../../../../Controllers/api/v1/facility/PromotionController');
const ScheduleController = require("../../../../Controllers/api/v1/facility/ScheduleController");
const FacilityController = require('../../../../Controllers/api/v1/facility/FacilityController');
const TrainingController = require('../../../../Controllers/api/v1/facility/TrainingController');
const CommonController = require('../../../../Controllers/api/v1/facility/CommonController');
const CoachController = require('../../../../Controllers/api/v1/facility/CoachController');
const AuthController = require("../../../../Controllers/api/v1/facility/AuthController");
const BookingController = require("../../../../Controllers/api/v1/facility/BookingController");
const RatingController = require("../../../../Controllers/api/v1/facility/RatingReviewController");
const DashboardController = require("../../../../Controllers/api/v1/facility/DashboardController");
const NotificationController = require("../../../../Controllers/api/v1/facility/NotificationController");
const checkFacilityAuth = require("../../../../middleware/checkFacilityAuth");
const trimRequest = require("trim-request");


// delete account 
router.delete("/delete/account", checkFacilityAuth, AuthController.deleteAccount); 

//update email after signup 
router.post('/change/email', AuthController.updateEmail);
router.post('/check/coachEsists',checkFacilityAuth, AuthController.checkCoachExists);
router.get('/logout', checkFacilityAuth, AuthController.logout);
//facility route
router.put('/update/deviceToken', checkFacilityAuth, AuthController.updateDeviceToken);
router.get('/get-facility', checkFacilityAuth, FacilityController.getFacility);
router.get('/get-facility-details', checkFacilityAuth, FacilityController.getFacilityDetails);
router.post('/add-facility', checkFacilityAuth, trimRequest.all, FacilityController.addNewFacility);
router.post('/update-profile', checkFacilityAuth, trimRequest.all, FacilityController.updateFacilityProfile);
router.post('/verify-stripe-account', checkFacilityAuth, trimRequest.all, FacilityController.verifyStripeAccount);
router.delete('/delete-facility/:facilityId', checkFacilityAuth, FacilityController.deleteFacility);
//coach route
router.get('/get-coaches', checkFacilityAuth, CoachController.getCoaches);
router.get('/get-coach-details/:id',checkFacilityAuth, CoachController.getCoachDetails);
router.post('/add-coach', checkFacilityAuth, trimRequest.all, CoachController.addNewCoach);
router.post('/update-coach', checkFacilityAuth, trimRequest.all, CoachController.updateCoachProfile);
router.delete('/delete-coach/:coachId', checkFacilityAuth, CoachController.deleteCoach);
// router.get('/get-asigned/facility-branches/list', CoachController.getFacilityBranchList);

//Training route
router.post('/create-training', checkFacilityAuth, trimRequest.all, TrainingController.createTraining);
router.post('/training/update', checkFacilityAuth, trimRequest.all, TrainingController.updateTraining);
router.get('/get-trainings', checkFacilityAuth, TrainingController.getTraining);
router.get('/training/details', checkFacilityAuth, TrainingController.getTrainingDetails);
router.get('/training/get-sports-list/', checkFacilityAuth, TrainingController.getSportsList);
router.get('/training/facility/list', checkFacilityAuth, TrainingController.getFacilityList);
router.get('/training/coach/list', checkFacilityAuth, TrainingController.getCoachList)
router.delete('/delete-training/:trainingId', checkFacilityAuth, TrainingController.deleteTraining);

// Booked Trainings route
router.get('/get-bookedTrainings/list', checkFacilityAuth,  BookingController.getAssignedTrainingList ); 
router.get('/get-scheduled/bookedTrainings/list', checkFacilityAuth,  BookingController.getScheduleAssignedTrainingList );
router.get("/get-trainingBooking/details/:bookingId", checkFacilityAuth,  BookingController.getBookingDetails);
router.get("/bookedTraining/get-facility-list", checkFacilityAuth,  BookingController.getFacilityList);
router.get("/training/get-student/details", checkFacilityAuth,  BookingController.getStudentDetails);
router.get("/training/get-student/attendence/history", checkFacilityAuth,  BookingController.getAttendanceHistory);
router.put("/trainingSlot/markAttendance", checkFacilityAuth, trimRequest.all,  BookingController.markAttendance);
router.get("/training/get-history", checkFacilityAuth,  BookingController.getTrainingHistory);

//common controller for facility admin & coach
router.get('/get-profile', checkFacilityAuth,  CommonController.getProfile);
router.post("/change/password", trimRequest.all,  CommonController.changePassword);

//help/support
router.post('/help', checkFacilityAuth, trimRequest.all, CommonController.postHelpQuery);

//promotion
router.get('/get/banners/list', checkFacilityAuth, PromotionController.getAllBannersList);
router.post('/promotion/create', checkFacilityAuth, trimRequest.all, PromotionController.createPromotion);
router.get('/promotion/list', checkFacilityAuth, PromotionController.getPromotion);
router.delete('/promotion/delete/:promotionId', checkFacilityAuth, PromotionController.deletePromotion);

//schedule
router.get('/schedule/list', checkFacilityAuth, ScheduleController.getSchedules);

// Evaluation Requests
router.post('/training/mark/evaluation', checkFacilityAuth, trimRequest.all, BookingController.markEvaluation);
router.get('/get-evaluation/list', checkFacilityAuth, BookingController.getEvaluationList);


// Rating and review apis
router.get("/coach/get-reviewList/:coachId", checkFacilityAuth, RatingController.getCoachReviewsList);
router.get("/get-reviewList/:facilityId", checkFacilityAuth, RatingController.getFacilityReviewsList);
router.get("/training/get-reviewList/:trainingId", checkFacilityAuth, RatingController.getReviewsList);

//Get notifications list
router.get("/get-notifications/list", checkFacilityAuth, trimRequest.all, NotificationController.getNotificationsList);
router.put("/mark/notification/seen", checkFacilityAuth, trimRequest.all, NotificationController.markReadNotification);

//facility app dashboard apis
router.get("/get-dashboard/summary", checkFacilityAuth, DashboardController.getDashboardSummary);
router.get("/get-training-bookings/graph", checkFacilityAuth, DashboardController.getBookingsGraph);
router.get("/get-revenue/graph", checkFacilityAuth, DashboardController.getRevenueGraph);
router.get("/get-training/revenue/detail/:id", checkFacilityAuth, DashboardController.getTrainingRevenueDetails);
router.get("/get-trainings/graph", checkFacilityAuth, DashboardController.getTrainingsGraph);
router.get("/get-students/graph", checkFacilityAuth, DashboardController.getStudentsGraph);

module.exports = router