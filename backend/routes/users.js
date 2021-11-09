var axios = require("axios");
var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const upload = require("../middleware/imageUpload");
const auth = require("../middleware/auth");

router.post(
  "/",
  /*auth,*/ async (req, res) => {
    axios
      .post(process.env.USERS_SERVICE_URL + "/users", {
        userName: "erkanerk",
        email: "erkannn@erk.com",
        password: "123",
      })
      .then(function (response) {
        res.json(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
);

module.exports = router;
