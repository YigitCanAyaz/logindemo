const request = require("request-promise");
const cheerio = require("cheerio");
const express = require("express");
const http = require("http");
const path = require("path");
const mongoose = require("mongoose");
const Publisher = require("./models/Publisher");
const User = require("./models/User");

const dotenv = require("dotenv");
dotenv.config();
const MONGO_URI = process.env.MNG_URI;

const app = express();
const router = express.Router();
var loggedUsername;

async function handler(req, res) {
  try {
    await request(req.body.appStoreUrl, (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const htmlOutput = cheerio.load(html);
        const dataMain = htmlOutput(".l-row l-row--peek");
        const index = dataMain.find("a").text();
        let array = [];
        htmlOutput(".l-row").each((i, data) => {
          for (let j = 0; j < htmlOutput(data).children().length; j++) {
            array.push(htmlOutput(data).children()[j].attribs.href);
          }
        });
        res.status(201).send(JSON.stringify(array));
        console.log(array);
      }
    });
  } catch (err) {
    res.status(500).send();
  }
}

async function addStore(req, res) {
  if (loggedUsername !== undefined) {
    Publisher.countDocuments(
      { username: loggedUsername },
      function (err, count) {
        if (count === 0) {
          const { name, publisherId, appStoreUrl, gameList } = req.body;

          const newPublisher = new Publisher({
            name: name,
            publisherId: publisherId,
            appStoreUrl: appStoreUrl,
            gameList: gameList,
            username: loggedUsername,
          });

          newPublisher.save();

          res.json({
            body: { toast: "Creation successfull." },
            error: null,
          });
        }
      }
    );
  } else {
    return res
      .status(403)
      .json({ body: { toast: "API Not Working. Check Your Paramaters" } });
  }
}

async function compare(req, res) {
  try {
    if (loggedUsername !== undefined) {
      Publisher.find({ username: loggedUsername }, function (err, doc) {
        doc.forEach((element) => {
          let databaseAppStoreUrl = element.appStoreUrl;
          let databaseGameList = element.gameList;

          request(databaseAppStoreUrl, (error, response, html) => {
            if (!error && response.statusCode == 200) {
              const htmlOutput = cheerio.load(html);
              const dataMain = htmlOutput(".l-row l-row--peek");
              const index = dataMain.find("a").text();
              let array = [];
              htmlOutput(".l-row").each((i, data) => {
                for (let j = 0; j < htmlOutput(data).children().length; j++) {
                  array.push(htmlOutput(data).children()[j].attribs.href);
                }
              });

              let difference = array
                .filter((x) => !databaseGameList.includes(x))
                .concat(databaseGameList.filter((x) => !array.includes(x)));

              if (difference.length != 0) {
                User.findOne(
                  { username: loggedUsername },
                  function (err, foundUser) {
                    if (err) return handleError(err);

                    difference.forEach((element) => {
                      if (foundUser.difference.indexOf(element) === -1) {
                        foundUser.difference.push(element);
                      }
                    });
                    foundUser.save();
                  }
                );
              }
              console.log(difference);
              res.status(201).send(JSON.stringify(difference));
            }
          });
        });
      });
    }
  } catch (err) {
    res.status(500).send();
  }
}

async function getDifferences(req, res) {
  try {
    if (loggedUsername !== undefined) {
      User.findOne({ name: loggedUsername }, function (err, foundUser) {
        if (err) return handleError(err);

        res.status(201).send(JSON.stringify(foundUser.difference));
      });
    }
  } catch (err) {
    res.status(500).send();
  }
}

async function addDifferences(req, res) {
  try {
    let differentUrl = req.body.differenceUrl;
    Publisher.findOne({ username: loggedUsername }, function (err, doc) {
      doc.gameList.push(differentUrl);
      doc.save();
    });
    res.status(201).send();
  } catch (err) {
    res.status(500).send();
  }
}

async function removeDifferences(req, res) {
  try {
    let differentUrl = req.body.differenceUrl;
    console.log("differentUrl", differentUrl);
    console.log("loggedUsername", loggedUsername);
    User.findOne({ username: loggedUsername }, function (err, doc) {
      var index = doc.difference.indexOf(differentUrl);
      console.log("index", index);
      console.log("0", doc.difference[0]);
      doc.difference.splice(index, 1);
      doc.save();
    });
    // user.save();
    res.status(201).send();
  } catch (err) {
    res.status(500).send();
  }
}

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// parse application/json
app.use(express.json());

app.post("/addStore", addStore);

app.post("/getdata", handler);

app.post("/compare", compare);

app.post("/getDifferences", getDifferences);

app.post("/addDifferences", addDifferences);

app.post("/removeDifferences", removeDifferences);

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "login.html"));
});

app.get("/home", (req, res) => {
  res.sendFile(path.resolve(__dirname, "home.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.resolve(__dirname, "login.html"));
});

app.get("/registration", (req, res) => {
  res.sendFile(path.resolve(__dirname, "registration.html"));
});

app.post("/register", async (req, res) => {
  try {
    let requestedUsername = req.body.username;
    User.findOne({ username: requestedUsername }, function (err, foundUser) {
      if (err) return handleError(err);
      if (!foundUser) {
        let newUser = new User({
          id: Date.now(),
          username: req.body.username,
          password: req.body.password,
          difference: [],
        });

        newUser.save();

        res.send(
          "<div align ='center'><h2>Registration successful</h2></div><br><br><div align='center'><a href='./login'>login</a></div><br><br><div align='center'><a href='./registration'>Register another user</a></div>"
        );
      } else {
        res.send(
          "<div align ='center'><h2>Username already used</h2></div><br><br><div align='center'><a href='./registration'>Register again</a></div>"
        );
      }
    });
  } catch {
    res.send("Internal server error");
  }
});

app.post("/login", async (req, res) => {
  try {
    let requestedUsername = req.body.username;
    User.findOne({ username: requestedUsername }, function (err, foundUser) {
      console.log(err);
      if (foundUser) {
        let submittedPass = req.body.password;
        let storedPass = foundUser.password;

        const passwordMatch = storedPass === submittedPass;
        if (passwordMatch) {
          loggedUsername = foundUser.username;
          res.sendFile(path.resolve(__dirname, "index.html"));
        } else {
          res.send(
            "<div align ='center'><h2>Invalid username or password</h2></div><br><br><div align ='center'><a href='./login'>login again</a></div>"
          );
        }
      } else {
        res.send(
          "<div align ='center'><h2>Invalid username or password</h2></div><br><br><div align='center'><a href='./login'>login again<a><div>"
        );
      }
    });
  } catch {
    res.send("Internal server error");
  }
});

app.listen(3000, function () {
  console.log(
    "Express started on http://localhost:" +
      3000 +
      "; press Ctrl-C to terminate."
  );
});

// Mongo Connection
mongoose.connect(MONGO_URI, { useNewUrlParser: true }, (err) => {
  if (err) throw err;
  console.log("holonext-db connected.");
});
