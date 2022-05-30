const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const publisherSchema = new Schema(
    {
        publisherId: String,
        appStoreUrl: String,
        name: String,
        gameList: [],
        username: String


    },

    {
        collection: "publishers",
    }
);

const Publisher = mongoose.model("publishers", publisherSchema);

module.exports = Publisher;
