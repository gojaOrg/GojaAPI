const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcrypt");

const FollowedSchema = new mongoose.Schema({
  created_at: { type: Date, default: Date.now },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  followedUserIds: {
    type: [mongoose.Schema.Types.ObjectId],
  },
});

module.exports = Followed = mongoose.model("followed", FollowedSchema);