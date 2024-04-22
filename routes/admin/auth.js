const express = require("express");
const router = express.Router();
const auth = require("../../middleware/adminCheckAuth");
const AuthController = require("../../Controllers/admin/AuthController");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/sendLink", AuthController.forgotPassword);
router.post("/update_password", AuthController.updateForgotPassword);
router.post("/change-password", auth, AuthController.changePassword);
router.post("/upload/media", AuthController.uploadAdminMedia);

//user account verify
router.get("/account_verify/:token", AuthController.accountVerify);

module.exports = router;
