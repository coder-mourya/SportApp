const express = require("express");
const router = express.Router();
const auth = require("../../middleware/adminCheckAuth");
const CommissionController = require("../../Controllers/admin/CommissionController");


router.get("/list",auth, CommissionController.CommissionList);
router.post("/add", auth, CommissionController.addCommission);
router.get("/list/download", CommissionController.downloadCommissionList);
router.get("/details/:id",auth, CommissionController.  getCommisionDetails);
router.put("/edit/details", auth, CommissionController.editCommission);
// router.post("/change/status", auth, CommissionController.UpdateStatus);
router.delete("/delete/:id", auth, CommissionController.deleteCommission);
router.get("/facility/list", auth, CommissionController.getFacilityList);
router.get("/sport/list", auth, CommissionController.getSportsList);



module.exports = router; 
