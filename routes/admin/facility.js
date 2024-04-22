const express = require("express");
const router = express.Router();
const auth = require("../../middleware/adminCheckAuth");
const FacilityController = require("../../Controllers/admin/FacilityController");


router.get("/list",auth, FacilityController.FacilityBranchList);
router.get("/list/download", FacilityController.downloadFacilityBranchList);
router.get("/admin/details/:id",auth, FacilityController.FacilityAdminDetails);
router.get("/branch/details/:id",auth, FacilityController.FacilityBranchDetails);
router.get("/branch/training/list/:id",auth, FacilityController.facilityTrainingsList);
router.get("/branch/bookings/list/:id",auth, FacilityController.facilityBookingsList);
router.get("/branch/payments/list/:id",auth, FacilityController.facilityPaymentsList);
router.get("/branch/reviews/list/:id",auth, FacilityController.facilityReviewsList);
router.get("/branch/training/list/download/:id", FacilityController.downloadFacilityTrainingsList);
router.get("/branch/bookings/list/download/:id", FacilityController.downloadFacilityBookingsList);
router.get("/branch/payments/list/download/:id", FacilityController.downloadFacilityPaymentsList);
router.get("/coach/list",auth, FacilityController.CoachList); 
router.get("/coach/list/download", FacilityController.downloadCoachList);
router.get("/coach/trainingsList/download/:id", FacilityController.downloadCoachTrainingsList);
router.get("/coach/facilityAminsList/download/:id", FacilityController.downloadCoachFacilityAdminsList);
router.get("/coach/details/:id",auth, FacilityController.CoachDetails);
router.get("/coach/facilityAdmins/list/:id",auth, FacilityController.CoachFacilityAdmins);
router.get("/coach/trainings/list/:id",auth, FacilityController.coachTrainings);
router.get("/coach/reviews/list/:id",auth, FacilityController.coachReviews);
router.get("/coach/facilityAdmins/list/:id",auth, FacilityController.CoachFacilityAdmins);
router.put("/edit/details/:id", auth, FacilityController.EditFacility);
router.post("/change/status", auth, FacilityController.UpdateStatus) 



// //User Teams
// router.get("/teams/list/:id",auth, UserController.UserTeamList);
// router.get("/teams/list/download/:id", UserController.downloadTeamsList);


module.exports = router; 
