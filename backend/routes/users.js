var axios = require("axios");
var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const auth = require("../middleware/auth");

router.post(
  "/",
  /*auth,*/ async (req, res) => {
    var form = req.body;
    axios
      .post(process.env.USERS_SERVICE_URL + "/users/signup", form)
      .then(function (response) {
        res.json(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
);

module.exports = router;
