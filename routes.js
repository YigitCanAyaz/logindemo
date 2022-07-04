const request = require("request-promise");
const cheerio = require("cheerio");
const http = require("http");
const path = require("path");
const Publisher = require("./models/Publisher");
const User = require("./models/User");
const express = require("express");

var loggedUsername;

module.exports = function (app) {
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

  app.post("/getPublishers", getPublishers);

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
      console.log(requestedUsername);
      User.findOne({ username: requestedUsername }, function (err, foundUser) {
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
};

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
    Publisher.findOne({ username: loggedUsername, appStoreUrl: req.body.appStoreUrl }, function (err, foundPublisher) {

      console.log(foundPublisher);
      console.log(loggedUsername);
      console.log('req.body.appStoreUrl', req.body.appStoreUrl)

      if (!foundPublisher) {

        console.log('count is 0');

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

      else {
        console.log('count is not 0');

        res.json({
          body: { toast: "There is already a publisher." },
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
        let sumDifferences = [];
        doc.forEach((element) => {
          let databaseAppStoreUrl = element.appStoreUrl;
          let databaseGameList = element.gameList;
          let publisherName = element.name;

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

              console.log("difference", difference);
              sumDifferences.push(difference);

              if (difference.length != 0) {
                User.findOne(
                  { username: loggedUsername },
                  function (err, foundUser) {
                    if (err) return handleError(err);

                    difference.forEach((element) => {
                      let index = foundUser.difference.findIndex(item => item.element === element);
                      console.log('index', index);
                      if (index === -1) {
                        foundUser.difference.push({ element, publisherName });
                      }
                    });
                    foundUser.save();
                  }
                );
              }
            }
          });
        });
      });
    }
  } catch (err) {
    res.status(500).send();
  }
}

const addToDifference = async function (databaseAppStoreUrl, databaseGameList) {
  let difference = [];
  await request(databaseAppStoreUrl, (error, response, html) => {
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

      console.log(
        array
          .filter((x) => !databaseGameList.includes(x))
          .concat(databaseGameList.filter((x) => !array.includes(x)))
      );

      difference.push(
        array
          .filter((x) => !databaseGameList.includes(x))
          .concat(databaseGameList.filter((x) => !array.includes(x)))
      );

      // var myUser = await User.findOne(
      //     { username: loggedUsername },
      //     function (err, foundUser) {
      //       console.log("sadjasjasdjsdja");
      //       if (err) return handleError(err);
      //       console.log(foundUser.difference);
      //       console.log(difference);
      //       difference.forEach((element) => {
      //         console.log("10000");
      //         if (foundUser.difference.indexOf(element) === -1) {
      //           if (foundUser.difference.length === 0) {
      //             foundUser.difference.push(element);
      //           } else {
      //             foundUser.difference[0].push(element);
      //           }
      //         }
      //       });
      //       foundUser.save();
      //       console.log(foundUser.difference);
      //     }
      //   );
      //   console.log("sadasd");
      //   console.log(myUser, "sadsadas");
    }
  });
  var myUser = await User.findOne({ username: loggedUsername });
  myUser.difference.push(difference);
  await myUser.save();
  console.log(myUser, "sadsadas");
  return difference;
};

async function getDifferences(req, res) {
  try {
    User.findOne({ username: loggedUsername }).then(function (foundUser) {
      if (foundUser.difference[0] !== null) {
        console.log("foundUser.difference", foundUser.difference);
        res.status(201).send(JSON.stringify(foundUser.difference));
      }
    });
  } catch (err) {
    res.status(500).send();
  }
}

async function getPublishers(req, res) {
  try {
    let publishers = [];
    Publisher.find(
      { username: loggedUsername},
      function (err, doc) {
        doc.forEach((element) => {
          publishers.push(element.name);
        });
        console.log('publishers', publishers);
        res.status(201).send(JSON.stringify(publishers));
      }
    );
  } catch (err) {
    res.status(500).send();
  }
}

async function addDifferences(req, res) {
  try {
    let differentUrl = req.body.differenceUrl;
    let publisherName = req.body.publisherName;
    Publisher.find(
      { username: loggedUsername, name: publisherName },
      function (err, doc) {
        doc.forEach((element) => {
          element.gameList.push(differentUrl);
          element.save();
        });
      }
    );
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
      for (var i = 0; i < doc.difference.length; i++) {
        if (doc.difference[i].element === differentUrl) {
          doc.difference.splice(i, 1);
        }
      }
      // console.log("doc.difference", doc.difference);
      // console.log(
      //   "docccc",
      //   doc.difference[Object.keys(doc.difference)[0]].element
      // );
      // var index = doc.difference[Object.keys(doc.difference)[0]].element;
      // console.log("index", index);
      // console.log("0", doc.difference[0]);
      // doc.difference.splice(index, 1);
      doc.save();
    });
    // user.save();
    res.status(201).send();
  } catch (err) {
    res.status(500).send();
  }
}
