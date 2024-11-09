const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  }
});

const Users = mongoose.model("Users", userSchema);
module.exports = Users;
