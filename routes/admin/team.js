const express = require("express");
const router = express.Router();
const auth = require("../../middleware/adminCheckAuth");
const TeamsController = require("../../Controllers/admin/TeamsController");
const TeamController = require("../../Controllers/api/v1/user/TeamController");

router.get("/list", auth, TeamsController.list);
router.get("/list/download", TeamsController.downloadTeamList);
router.get("/details/:id", auth, TeamsController.teamDetails);
router.get("/members/list/:id", auth, TeamsController.getTeamMembersList);

module.exports = router;
