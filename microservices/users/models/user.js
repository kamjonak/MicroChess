let mongoose = require("mongoose");

let UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

module.exports = mongoose.model("User", UserSchema);