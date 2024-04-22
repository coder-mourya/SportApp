const express = require("express");
const router = express.Router();
const auth = require("../../middleware/adminCheckAuth");
const NotificationController = require("../../Controllers/admin/NotificationController");
const CmsController = require("../../Controllers/admin/CmsController");
const SupportController = require("../../Controllers/admin/SupportController");
const BannerController = require("../../Controllers/admin/BannerController");
const PromotionController = require("../../Controllers/admin/PromotionsController");
const DashboardController = require("../../Controllers/admin/DashboardController");


router.get("/cms/list", auth, CmsController.getCmsList);
router.get("/cms/details/:id", auth, CmsController.getCmsDetails);
router.post("/update/cms", auth, CmsController.editCms);
router.delete("/cms/delete/:id", auth, CmsController.deleteCms);
router.get("/support/list", auth, SupportController.getQueriesList);
router.post("/reply/query", auth, SupportController.replyQuery);
router.delete("/support/delete/:id", auth, SupportController.deleteSupport);
router.get("/banner/list", auth, BannerController.getBannerList);
router.post("/add/banner", auth, BannerController.addBanner);
router.get("/banner/details/:id", auth, BannerController.bannerDetails);
router.put("/update/banner", auth, BannerController.editBanner);
router.get("/allBanners/list", auth, BannerController.getAllBannersList);
router.delete("/delete/bannner/:id", auth, BannerController.deleteBanner);
router.get("/allFacilities/list", auth, PromotionController.getFacilityList);
router.get("/promotions/list", auth, PromotionController.getPromotionList);
router.post("/add/promotion", auth, PromotionController.addPromotion);
router.get("/promotion/details/:id", auth, PromotionController.getPromotionDetails);
router.put("/update/promotion", auth, PromotionController.editPromotion);
router.delete("/delete/promotion/:id", auth, PromotionController.deletePromotion);
router.get("/promotion/list/download", PromotionController.downloadPromotionList);
router.post("/notification/create", auth, NotificationController.sendNotification)
router.get("/notification/list", auth, NotificationController.getNotificationList)
router.delete("/notification/delete/:id", auth, NotificationController.deleteNotification);
router.get("/allUsers/list", auth, NotificationController.getAllUsers);
router.get("/allFacilityAdmin/list", auth, NotificationController.getAllFacilityAdmins);
router.get("/user/graph", auth,DashboardController.getUserGraph);
router.get("/user/map", auth,DashboardController.getUserMapData);
router.get("/event/graph", auth,DashboardController.getEventGraph);
router.get("/training/graph", auth,DashboardController.getTrainingGraph);
router.get("/team/graph", auth,DashboardController.getTeamGraph);
router.get("/revenue/graph", auth,DashboardController.getRevenueGraph);
router.get("/dashboard/summary", auth,DashboardController.getDashboardSummary);



module.exports = router;