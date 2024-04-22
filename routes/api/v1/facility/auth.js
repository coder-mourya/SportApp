const express = require('express')
const router = express.Router()
const AuthController = require('../../../../Controllers/api/v1/facility/AuthController');
const trimRequest = require("trim-request");

router.post('/register', trimRequest.all, AuthController.register)
router.post('/check_mobile_exists',trimRequest.all, AuthController.CheckMobileExists)
router.post('/check_email_exists', trimRequest.all, AuthController.checkEmailExists)
router.post('/login', trimRequest.all, AuthController.login)

//verify account
router.post('/send/mail-verification/link', trimRequest.all, AuthController.sendLink);
router.post('/resend/mail-verification/link', trimRequest.all, AuthController.resendLink);
router.get("/email_account_verification/:token", AuthController.verifyEmail); 

// Forgot Password and Reset password

router.post("/sendLink", trimRequest.all, AuthController.forgotPassword);
router.post("/update_password", trimRequest.all, AuthController.updateForgotPassword);


//generate stripe account setup link route
router.get('/resend-account-link/:accountId/:email', AuthController.refreshAccountSetupLink);
router.get('/return-success', AuthController.returnSuccess);
module.exports = router