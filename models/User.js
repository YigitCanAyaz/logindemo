const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        id: Number,
        username: String,
        password: String,
        difference: []
    },

    {
        collection: "users",
    }
);

const User = mongoose.model("users", userSchema);

module.exports = User;
