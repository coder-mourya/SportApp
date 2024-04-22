const express = require("express");
const router = express.Router();
const checkAuth = require("../../../middleware/checkAuth");
const UserController = require("../../../Controllers/api/v1/UserController");
const CommonController = require("../../../Controllers/api/v1/CommonController");
const TeamController = require("../../../Controllers/api/v1/user/TeamController");
const EventController = require("../../../Controllers/api/v1/user/EventController");
const UserProfileController = require("../../../Controllers/api/v1/user/ProfileController");
const TrainingController = require("../../../Controllers/api/v1/user/TrainingController")
const BookingController = require("../../../Controllers/api/v1/user/BookingController");
const CartController = require("../../../Controllers/api/v1/user/CartController");
const RatingController = require("../../../Controllers/api/v1/user/RatingReviewController");
const ScheduleController = require("../../../Controllers/api/v1/user/ScheduleController");
const NotificationController = require("../../../Controllers/api/v1/user/NotificationController");
const AuthController = require("../../../Controllers/api/v1/AuthController");
const trimRequest = require("trim-request");
const { trim } = require("lodash");
const RatingReviewController = require("../../../Controllers/api/v1/user/RatingReviewController");


router.get("/sports/list", UserController.SportsList);
router.put("/update/sports", checkAuth, UserController.UpdateSports);
router.get("/sports/count", checkAuth, UserController.UserSportsCount);
router.get("/mySports/list", checkAuth, UserController.MySportsList);


//Delete Account
router.delete("/delete/account", checkAuth, UserController.deleteAccount);


//About Me
router.put("/update/aboutMe", checkAuth, UserController.UpdateAboutMe);

// help route (Raise Query To Admin)
router.post("/help", checkAuth, UserController.postHelpQuery);

//upload media
router.post("/upload/media", CommonController.uploadMedia);

// User Team routes
router.get("/teams/colours/list", TeamController.TeamColoursList);
router.get("/myteams/list", checkAuth, TeamController.myTeamList);
router.post("/create/team", checkAuth, trimRequest.all, TeamController.createTeam);
router.get("/team/details/:teamId", checkAuth, TeamController.teamDetails);
router.get("/team/membersList/download/:teamId", TeamController.downloadMembersList);
router.post("/team/add-member", checkAuth, trimRequest.all, TeamController.addMemberInTeam);
router.post("/team/request/accept-reject", checkAuth, trimRequest.all, TeamController.acceptTeamRequest);
router.get("/team/request/:teamId/:email/:memberId", TeamController.getTeamRequestDetails);
router.put("/team/member/delete", checkAuth, trimRequest.all, TeamController.deleteTeamMember);
router.put("/team/change/adminStatus/member", checkAuth, trimRequest.all, TeamController.changeAdminStatus);
router.put("/team/edit/:teamId", checkAuth, TeamController.teamEdit);
router.delete("/team/delete/:teamId", checkAuth, TeamController.teamDelete);
//normal user member routes
router.post("/add-member", checkAuth, trimRequest.all, TeamController.addNormalMember);
router.get("/get-all-members", checkAuth, TeamController.getAllMembers);
router.get("/get-members-teams-list/:memberId/:creatorId", checkAuth, TeamController.getMemberTeamsList);
router.post("/all-member/delete", checkAuth, TeamController.allMemberDelete);
router.post("/member/request/accept-reject", trimRequest.all, checkAuth, TeamController.acceptMemberRequest);
router.get("/add-member/request/:member_id", TeamController.getMemberRequestDetails);
//family member route
router.post("/add-family-member", checkAuth, trimRequest.all, TeamController.addFamilyMember);
router.put("/edit-family-member/:memberId", checkAuth, trimRequest.all, TeamController.editFamilyMember);
router.get("/get-family-members", checkAuth, TeamController.getFamilyMembers);


//event route
router.get("/event/list", checkAuth, EventController.getEventList);
router.get("/get-facility-list", EventController.getFacilityList);
router.post("/event/create", checkAuth, trimRequest.all, EventController.createEvent);
router.get("/event/details/:eventId", checkAuth, EventController.eventDetails);
router.put("/event/edit/:eventId", checkAuth, EventController.eventEdit);
router.get("/event/membersList/download/:eventId", EventController.downloadMembersList);
router.post("/event/request/accept-reject", checkAuth, trimRequest.all, EventController.acceptEventRequest);
router.get("/event/request/:eventId/:email/:memberId", EventController.getEventRequestDetails);
router.post("/event/add/member", checkAuth, trimRequest.all, EventController.addMemberInEvent);
router.put("/event/change/adminStatus/member", checkAuth, trimRequest.all, EventController.changeEventAdminStatus);
router.put("/event/end", checkAuth, trimRequest.all, trimRequest.all, EventController.endEvent);
router.delete("/event/cancel/:eventId", checkAuth, EventController.cancelEvent);
//expenses in event routes
router.post("/event/add/expense", checkAuth, trimRequest.all, EventController.addExpenseInEvent);
router.put("/event/edit/expense/:expenseId", checkAuth, trimRequest.all, EventController.editExpenseInEvent);
router.delete("/event/expense/delete/:expenseId", checkAuth, trimRequest.all, EventController.deleteExpenseInEvent );
router.post("/event/add/receipt", checkAuth, trimRequest.all, EventController.addExpenseReceipt);
// router.post("/event/confirm/expensePayment", checkAuth, EventController.confirmPaymentReceipt);
router.post("/event/confirm/expensePayment", checkAuth, EventController.confirmPaymentReceipt)
//payments in events routes
router.post("/event/split/payment", checkAuth, trimRequest.all, EventController.splitPaymentInEvent);
router.get("/event/payment/request/:memberId/:eventId/:email", trimRequest.all, EventController.getEventPaymentDetails);
router.post("/event/send/request/reminder/join", checkAuth , trimRequest.all, EventController.sendEventRequestReminder)
router.post("/event/send/payment/reminder", checkAuth , trimRequest.all, EventController.sendPaymentReminder)


//my schedules route
router.get("/get-mySchedules/:date", checkAuth, ScheduleController.getMyAllSchedules);
router.get("/event/get-mySchedules", checkAuth, EventController.getMySchedules);
router.get("/event/get-mySchedules-sync", checkAuth, EventController.getMySchedulesForSync);
router.get("/event/get-pendingPayments", checkAuth, EventController.getPendingPaymentsList);




//training routes
router.post("/training/mark-unmark/favourite", checkAuth, trimRequest.all, TrainingController.favouriteUnfavouriteTraining);
router.get("/favourite/trainings", checkAuth, trimRequest.all, TrainingController.favouriteTrainings);
router.get('/training/list',checkAuth, TrainingController.getTrainingsList);
router.get('/training/details',checkAuth, TrainingController.getTrainingDetails);
router.post("/training/get-platformFees", checkAuth, TrainingController.getPlatformFees);


//cart routes
router.post("/check/Training/Availability", checkAuth, trimRequest.all, CartController.checkTrainingAvailability);
router.post("/addTraining/to/Cart", checkAuth, trimRequest.all , CartController.addToCart);
router.put("/updateTraining/to/Cart/:cartId", checkAuth, trimRequest.all, CartController.updateCart);
router.get("/get-cartList", checkAuth, trimRequest.all, CartController.getCartList);
router.get("/get-cartDetails/:cartId", checkAuth, trimRequest.all, CartController.getCartDetails);


// promotion routes for training
router.get("/training/get-promotions/:trainingId", checkAuth, trimRequest.all, CartController.getPromotion);
router.get("/training/get-promotion-detail/:promotionId", checkAuth, trimRequest.all, CartController.getPromotionDetails);
router.post("/training/apply/promoCode", checkAuth, trimRequest.all, BookingController.applyPromoCode);

//promotion routes
router.get("/flash/promotion/list", checkAuth, BookingController.getAllPromotionList);


//Booking routes
router.post("/create/customer", checkAuth, trimRequest.all, BookingController.createCustomer);
router.post("/create/payment-method", checkAuth, trimRequest.all, BookingController.createPaymentMethod);
router.post("/customer/saveCard", checkAuth, trimRequest.all , BookingController.saveCard);
router.delete("/customer/deleteCard/:customerId/:cardId", checkAuth, trimRequest.all , BookingController.deleteCard);
router.get("/customer/getCards/list/:customerId", checkAuth, trimRequest.all, BookingController.getCardsList);
router.put("/confirm/payment", checkAuth, trimRequest.all, BookingController.paymentConfirm);
router.post("/book/training", checkAuth, trimRequest.all, BookingController.trainingBooking);
router.get("/get-trainingBooking/list", checkAuth, trimRequest.all, BookingController.getBookedTrainingLists);
router.get("/get-trainingBooking/details/:bookingId", checkAuth, trimRequest.all, BookingController.getBookingDetails);
router.get("/get-training/bookings/list", checkAuth, trimRequest.all, BookingController.getBookingsList);
router.get("/get-training/bookings/details/:bookingId", checkAuth, trimRequest.all, BookingController.getTrainingBookingDetails);
router.get("/get-syncedTrainingBooking/list", checkAuth, trimRequest.all, BookingController.getSyncedBookedTrainingLists);
router.get("/training/get-student/attendence/history", BookingController.getAttendanceHistory);



//Evaluation Routes
router.post("/training/request/evaluation", checkAuth, trimRequest.all, BookingController.requestEvaluation);
router.get("/training/evaluations/list/:trainingId", checkAuth, trimRequest.all, BookingController.getEvaluationsList);

//Rating and review routes
router.post("/training/post/rating-review", checkAuth, trimRequest.all, RatingController.postRatingReview);
router.get("/training/get-reviewList/:trainingId", checkAuth, trimRequest.all, RatingController.getTrainingReviewsList);

//Get recently viewed trainings
router.get("/training/get-recent-view/list", checkAuth, trimRequest.all, RatingReviewController.getRecentViewsList);


//Get notifications list
router.get("/get-notifications/list", checkAuth, trimRequest.all, NotificationController.getNotificationsList);
router.put("/mark/notification/seen", checkAuth, trimRequest.all, NotificationController.markReadNotification);


//logout api
router.get("/logout", checkAuth, AuthController.logout);




//user profile route
router.get("/get-profile", checkAuth, UserProfileController.getProfile);
router.post("/update/profile", checkAuth, trimRequest.all, UserProfileController.updateProfile);
router.post("/change/password", checkAuth, trimRequest.all, UserProfileController.changePassword);


//cms route
router.get("/get-cms", CommonController.getCms);



//logout route
router.get("/logout", checkAuth, UserController.logout);

//chat apis
router.get("/room/members/list/:id", CommonController.getRoomMembersList);


module.exports = router;