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
