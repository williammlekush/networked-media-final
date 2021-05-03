// const https = require("https");
const path = require("path");
const fs = require("fs");

const express = require('express');
const app = express();
app.use(express.static('public'));
app.use("/assets", express.static("assets"));

const nedb = require("nedb");
const contentParams = new nedb({ filename: "databases/content-params.db", autoload: true });
const vidDb = new nedb({ filename: "databases/video-links.db", autoload: true });

contentParams.ensureIndex({ fieldName: "key", unique: true }, err => console.log(err));
vidDb.ensureIndex({ fieldName: "key", unique: true }, err => console.log(err));

app.get(
  "/keys",
  (req, res) => {
    contentParams.find(
      {},
      (err, data) => {
        if (err) throw err;
        
        const keys = [];

        data.forEach(content => keys.push(content.key));

        res.send(keys);
    });
});

app.get(
  "/content",
  (req, res) => {
    contentParams.find(
      req.query, 
      (err, data) => {
        if (err) throw err;

        const params = data[0];

        const returnData = {
          type: params.type,
          text: `/assets/text/${params.key}.txt`,
          font: params.font,
        }

        switch(params.type) {
          
          case "letter":
            res.send(returnData);
            break;

          case "letter-images":
            const imgPath = `assets/images/${params.key}`;

            fs.readdir(
              path.resolve(__dirname, imgPath),
              (err, files) => {
                if (err) throw err;

                const filePaths = [];

                files.forEach(file => {
                  filePaths.push(`${imgPath}/${file}`);
                })

                returnData.imgs = filePaths;

                res.send(returnData);
              });
            break;

          case "video":
            vidDb.find(
              req.query,
              (err, data) => {
                if (err) throw(err);
                
                returnData.vid = data[0].link;
                
                res.send(returnData);
              });
            break;

          default:
            break;
        }
    });
});

// const credentials = {
//    key: fs.readFileSync("cert/privkey1.pem"),
//    cert: fs.readFileSync("cert/cert1.pem")
// }

// const httpsServer = https.createServer(credentials, app);
// httpsServer.listen(443);

app.listen(80, function () {
  console.log('Example app listening on port 80!')
});