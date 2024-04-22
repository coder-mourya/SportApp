require("dotenv").config();
require("./config/connection");
const express = require("express");
const fs = require("file-system");
const fileUpload = require("express-fileupload");
var bodyParser = require("body-parser");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const i18n = require('i18n');
const cron = require('node-cron');
const cronJobFile = require("./cronjob/cron");
const acceptLanguageParser = require('accept-language-parser');
const app = express();
const morgan = require('morgan');
var cors = require("cors");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use("/public",express.static("public"));
app.use("/.well-known",express.static(".well-known"));
app.use("/public/images/flags", express.static("public/images/flags"));
app.use(fileUpload());

// *****Swagger api doc***/
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SportsNerve",
      version: "1.0.0",
    },
    servers: [{
      url: "http://3.12.253.202:4002/",
    }, ],
  },
  apis: ["./routes/*.js"], //your route folder
};

const swaggerSpec = swaggerJSDoc(options);
const swaggerDocument = require("./swagger.json");
const facilitySwaggerDocument = require("./facility-swagger.json");

app.use(
  "/api-docs",
  function (req, res, next) {
    var myIp = [];
    var whiteListeIp = ["122.160.62.239", "122.176.117.180", "59.144.166.73", "127.0.0.1"];
    // console.log("req.connection.remoteAddress============>>>>>>>>",req.connection.remoteAddress);
    // if(req.connection.remoteAddress){
    //    myIp= (req.connection.remoteAddress).split("::ffff:");
    // }
    //console.log("myIp", myIp, myIp[1])
    //console.log("whiteListeIp", whiteListeIp)
    // if(!whiteListeIp.includes(myIp[1])){
    //    let response = {           
    //         message: "Invalid  address",            
    //     };
    //     res.json(response);
    // }
    swaggerDocument.host = req.get("host");
    req.swaggerDoc = swaggerDocument;
    next();
  },
  swaggerUI.serveFiles(swaggerDocument, options),
  swaggerUI.setup()
);

app.use(
  "/facility-api-docs",
  function (req, res, next) {
    var myIp = [];
    var whiteListeIp = ["122.160.62.239", "122.176.117.180", "59.144.166.73", "127.0.0.1"];
    // console.log("req.connection.remoteAddress============>>>>>>>>",req.connection.remoteAddress);
    // if(req.connection.remoteAddress){
    //    myIp= (req.connection.remoteAddress).split("::ffff:");
    // }
    //console.log("myIp", myIp, myIp[1])
    //console.log("whiteListeIp", whiteListeIp)
    // if(!whiteListeIp.includes(myIp[1])){
    //    let response = {           
    //         message: "Invalid  address",            
    //     };
    //     res.json(response);
    // }
    facilitySwaggerDocument.host = req.get("host");
    req.swaggerDoc = facilitySwaggerDocument;
    next();
  },
  swaggerUI.serveFiles(facilitySwaggerDocument, options),
  swaggerUI.setup()
);

i18n.configure({
  locales: ['en', 'es', 'it'],
  directory: __dirname + '/locales'
});

app.use((req, res, next) => {
  const languages = acceptLanguageParser.parse(req.headers['accept-language']);
  if( languages.length ){
    const language = languages[0].code;
    i18n.setLocale(req, language);
    next();
  }
});

/* Certificate */
// var privateKey = fs.readFileSync("./ssl/quippysecure.key");
// var certificate = fs.readFileSync("./ssl/90b735fa440792c7.crt");
// var ca = fs.readFileSync("./ssl/gd_bundle-g2-g1.crt");
// var credentials = { key: privateKey, cert: certificate, ca: ca };


// Setup express server port from ENV, default: 3000
app.set('port', process.env.PORT || 3000)

// Enable only in development HTTP request logger middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(cors());
require("./routes/index")(app);

const cronJob = cron.schedule('0 0 * * *', () => {
  cronJobFile.transferMoney();
  cronJobFile.archiveEvents();
}, {
  timezone: "UTC"
});

// Start the cron job
cronJob.start();

 
//***********Create Server********** */
if (process.env.IsProduction == "true") {
  // var httpsServer = require("https").createServer(credentials, app);
  // httpsServer.listen(process.env.PORT, () => {
  //   console.log(
  //     "HTTPS Server is up and running on port numner " + process.env.PORT
  //   );
  // });
} else {
  var httpsServer = require("http").createServer(app);
  //socket.io
  const socket = require("socket.io");
  const io = socket(httpsServer, {
      cors: {
          origin: "*"
      }
  });
  require('./services/chat')(io);
  httpsServer.listen(app.get('port') || 3000, () => {
    console.log(
      "HTTP Server is up and running on port numner " + app.get('port')
    );
  });
}