var axios = require("axios");
var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const upload = multer();
var FormData = require("form-data");

router.post("/upload-image", auth, upload.any(), async function (req, res) {
  const { headers, files } = req;
  const { buffer, originalname: filename } = files[0];

  let formData = new FormData();
  formData.append("image", buffer, { filename });

  axios
    .post(process.env.USERS_SERVICE_URL + "/users/upload-image", formData, {
      headers: formData.getHeaders(),
    })
    .then((response) => {
      // Handle result…
      res.json(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
});

router.post("/signup", async (req, res) => {
  var form = req.body;
  axios
    .post(process.env.USERS_SERVICE_URL + "/users/signup", form)
    .then(function (response) {
      res.json(response.data);
    })
    .catch(function (error) {
      res.status(error.response.status).json(error.response.data);
    });
});
router.post("/login", async (req, res) => {
  var form = req.body;
  axios
    .post(process.env.USERS_SERVICE_URL + "/users/login", form)
    .then(function (response) {
      res.json(response.data);
    })
    .catch(function (error) {
      res.status(error.response.status).json(error.response.data);
    });
});

router.post(
  "/follow",
  [
    body("userToFollow", "Invalid input").trim().escape().isLength({
      min: 1,
    }),
  ],
  auth,
  async (req, res) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      // Error messages can be returned in an array using `errors.array()`.
      console.log("Found validation errors");
      return res.status(422).json({
        errors: errors.array(),
      });
    } else {
      var form = req.body;
      form.userId = req.user._id;
      axios
        .post(process.env.USERS_SERVICE_URL + "/users/follow", form)
        .then(function (response) {
          res.json(response.data);
        })
        .catch(function (error) {
          res.status(error.response.status).json(error.response.data);
        });
    }
  }
);

router.post(
  "/unfollow",
  [
    body("userToUnfollow", "Invalid input").trim().escape().isLength({
      min: 1,
    }),
  ],
  auth,
  async (req, res) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      // Error messages can be returned in an array using `errors.array()`.
      console.log("Found validation errors");
      return res.status(422).json({
        errors: errors.array(),
      });
    } else {
      var form = req.body;
      form.userId = req.user._id;
      axios
        .post(process.env.USERS_SERVICE_URL + "/users/unfollow", form)
        .then(function (response) {
          res.json(response.data);
        })
        .catch(function (error) {
          res.status(error.response.status).json(error.response.data);
        });
    }
  }
);

module.exports = router;
