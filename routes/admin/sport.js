const express = require("express");
const router = express.Router();
const auth = require("../../middleware/adminCheckAuth");
const SportsController = require("../../Controllers/admin/SportsController");

router.get("/list", auth, SportsController.list);
router.get("/details/:id",auth, SportsController.sportDetails);
router.put("/change_status", auth, SportsController.updateStatus);
router.delete("/delete/:id", auth, SportsController.deleteSport);
router.post("/add", auth, SportsController.addSports);
router.put("/update", auth, SportsController.updateSport);

module.exports = router;
