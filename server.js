// const https = require("https");

const express = require('express');
const session = require("express-session");
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: true });

const path = require("path");
const bcrypt = require("bcrypt-nodejs");

const fs = require("fs");
const nedbStore = require("nedb-session-store")(session);
const nedb = require("nedb");

const app = express();

app.use(express.static('public'));
app.use("/assets", express.static("assets"));
app.use(urlencodedParser);
app.use(
  session(
    {
      secret: "secret",
      cookie: { maxAge: 365 * 60 * 60 * 1000 },
      store: new nedbStore({ filename: "databases/session.db" })
    }));

const contentParams = new nedb({ filename: "databases/content-params.db", autoload: true });
const vidDb = new nedb({ filename: "databases/video-links.db", autoload: true });
const users = new nedb({ filename: "databases/users.db", autoload: true });

contentParams.ensureIndex({ fieldName: "key", unique: true }, err => console.log(err));
vidDb.ensureIndex({ fieldName: "key", unique: true }, err => console.log(err));

let hbdayDone = false;

generateHash = function(pass) {
  return bcrypt.hashSync(pass);
}

compareHash = function(pass, hash) {
  return bcrypt.compareSync(pass, hash);
}

app.post(
  "/login",
  (req, res) => {
      users.findOne(
        { "user": "sunhi" },
        (err, doc) => {
          if(err) throw err;
          res.send({ success: compareHash(req.body.password, doc.pass), hbday: hbdayDone });
        });
  })


app.post(
  "/hbday-done",
  (req, res) => {
    hbdayDone = true;
  });

// app.post(
//   "/register",
//   (req, res) => {
//     const passHash = generateHash(req.body.password);

//     const registration = {
//       "user": req.body.username,
//       "pass": passHash
//     };

//     users.insert(registration);
//     res.send("<p>success</p>");
//   }
// )

app.get(
  "/gallery",
  (req, res) => {

    const key = req.query.key;

    res.send({
      thumbnailPath: `/assets/images/thumbnails/thumb-${key}.jpeg`,
      captionPath: `/assets/text/captions/caption-${key}.txt`
    });
  }
)

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