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

require("./routes")(app);

app.listen(8080, function () {
  console.log(
    "Express started on http://localhost:" +
      8080 +
      "; press Ctrl-C to terminate."
  );
});

// Mongo Connection
mongoose.connect(MONGO_URI, { useNewUrlParser: true }, (err) => {
  if (err) throw err;
  console.log("holonext-db connected.");
});
