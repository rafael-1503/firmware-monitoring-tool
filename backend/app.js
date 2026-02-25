const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var cors = require('cors');
const swaggerDocs = require("./swagger.js");
// const fs = require("fs");
// const https = require("https");
const dotenv = require("dotenv");
dotenv.config();

const initDatabaseConnection = require('./dbConnection.js');
const SiteSettings = require("./models/siteSettings.js");
const {hashPassword} = require("./utils/password.js");


const app = express();


app.use(cors({
  origin:["http://localhost:8080", "http://localhost:3000", "https://localhost:3000"],
  credentials:true
}))



// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(cookieParser());


initDatabaseConnection("firmware-monitoring");


require('./routes/session/session')(app);

require('./routes/firmware-monitoring/routes')(app);


(async () => {
  const existing = await SiteSettings.findOne({key: "sitePassword"});
  if(!existing && process.env.sitePasswd){
    const hash = await hashPassword(process.env.sitePasswd);
    await SiteSettings.create({key: "sitePassword", hash});
    console.log("Site-Passwort aus .env gesetzt. Kann aus .env jetzt gelöscht werden.")
  }
})();

// const key = fs.readFileSync("./certs/localhost-key.pem");
// const cert = fs.readFileSync("./certs/localhost.pem");

//default port
let port = process.env.PORT || 3030;

// https.createServer({key, cert}, app).listen(port, () => {
//   console.log(`Firmware-monitoring listening at https://localhost:${port}`)
// })




app.listen(port, '0.0.0.0', () => {
  console.log(`Backend läuft auf Port ${port}`)
});

swaggerDocs(app,port);