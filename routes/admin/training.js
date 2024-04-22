const express = require("express");
const router = express.Router();
const auth = require("../../middleware/adminCheckAuth");
const TrainingsController = require("../../Controllers/admin/TrainingsController");

router.get("/list", auth, TrainingsController.list);
router.get("/list/download", TrainingsController.downloadTrainingList);
router.get("/details/:id", auth, TrainingsController.trainingDetails);
router.get("/students/list/:id", auth, TrainingsController.studentsList);

module.exports = router;
