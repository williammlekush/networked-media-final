// const https = require("https");
// const fs = require("fs");

const express = require('express');
const app = express();
app.use(express.static('public'));

// const credentials = {
//    key: fs.readFileSync("cert/privkey1.pem"),
//    cert: fs.readFileSync("cert/cert1.pem")
// }

// const httpsServer = https.createServer(credentials, app);
// httpsServer.listen(443);

app.listen(80, function () {
  console.log('Example app listening on port 80!')
});