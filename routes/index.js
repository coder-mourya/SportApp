//api
const AuthRoute = require("../routes/api/v1/auth");
const UserRoute = require("../routes/api/v1/user");
//facility route
const FacilityAuthRoute = require('../routes/api/v1/facility/auth');
const FacilityRoute = require('../routes/api/v1/facility/facility');

//admin
const AdminAuth = require("../routes/admin/auth");
const AdminUser = require("../routes/admin/user");
const AdminSports = require("../routes/admin/sport");
const AdminFacility = require("../routes/admin/facility");
const AdminTeams = require("../routes/admin/team");
const AdminTrainings = require("../routes/admin/training");
const AdminCommissions = require("../routes/admin/commission");
const AdminCommon = require("../routes/admin/common");

//facility auth
const FacilityAuthMiddleware = require('../middleware/checkFacilityAuth');

module.exports = (app) => {
  app.use("/api/v1/auth", AuthRoute);
  app.use("/api/v1/user", UserRoute);

  //facility 
  app.use("/api/v1/facility/auth", FacilityAuthRoute);
  app.use("/api/v1/facility", FacilityAuthMiddleware, FacilityRoute);

  //admin
  app.use("/admin/auth", AdminAuth);
  app.use("/admin/user", AdminUser);
  app.use("/admin/sport", AdminSports);
  app.use("/admin/facility", AdminFacility);
  app.use("/admin/team", AdminTeams);
  app.use("/admin/training", AdminTrainings);
  app.use("/admin/commission", AdminCommissions);
  app.use("/admin/common", AdminCommon);

};