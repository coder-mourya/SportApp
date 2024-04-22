const express = require("express");
const router = express.Router();
const auth = require("../../middleware/adminCheckAuth");
const UserController = require("../../Controllers/admin/UserController");


router.get("/list",auth, UserController.list);
router.get("/list/download", UserController.downloadUsersList);
router.get("/details/:id",auth, UserController.userDetails);
router.put("/update",auth, UserController.updateUser);
router.post("/change_status",auth, UserController.updateStatus);
router.delete("/delete/:id",auth, UserController.deleteUser);

//others
router.get('/country_list',auth, UserController.countryList)
router.get('/state_list/:countryId',auth, UserController.stateList)
router.get('/city_list/:stateId',auth, UserController.cityist)



//User Teams
router.get("/teams/list/:id",auth, UserController.UserTeamList);
router.get("/teams/details/:teamId",auth, UserController.teamDetails);
router.get("/teams/list/download/:id", UserController.downloadTeamsList);

//User Events
router.get("/events/list/:id",auth, UserController.UserEventList);
router.get("/events/list/download/:id", UserController.downloadEventsList);

//User Training And Event Bookings
router.get("/training/bookings/list/:id",auth, UserController.userTrainingsBookingList);
router.get("/training/bookings/list/download/:id", UserController.downloadTrainingBookingList);
router.get("/event/bookings/list/:id",auth, UserController.userEventBookingList);
router.get("/event/bookings/list/download/:id", UserController.downloadEventBookingList);

//User Financials


 

module.exports = router;
