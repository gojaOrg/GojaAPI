var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const auth = require("../middleware/auth");
const Post = require("../models/postModel");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
var axios = require("axios");
const multer = require("multer");
const upload = multer();
var FormData = require("form-data");

router.get("/", auth, async (req, res) => {
  var userId = req.user._id;
  console.log(userId);
  axios({
    method: "get",
    url: process.env.POSTS_SERVICE_URL + "/posts/" + userId,
  }).then(function (response) {
    res.json(response.data);
  });
});

router.get("/:id", auth, async (req, res) => {
  var id = req.params.id;
  var jobs = await Products.find(
    { user: id },
    {
      desc: 1,
      photos: 1,
    }
  );
  res.json(jobs);
});

router.post(
  "/add-jobpictures",
  upload.array("photos", 12),
  function (req, res) {
    var fileLocations = [];
    console.log(req.files);
    for (i = 0; i < req.files.length; i++) {
      fileLocations.push(req.files[i].location);
    }
    res.json(fileLocations);
  }
);
router.post("/add-audio", auth, upload.any(), async function (req, res) {
  const { headers, files } = req;
  const { buffer, originalname: filename } = files[0];
  console.log(filename);

  let formData = new FormData();
  formData.append("file", buffer, { filename });

  const config = { header: { "Content-Type": "multipart/form-data" } };
  axios
    .post(process.env.POSTS_SERVICE_URL + "/posts/add-audio", formData, {
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
router.post("/", auth, async (req, res, next) => {
  var form = req.body;
  console.log(req.user._id);
  form.user.id = req.user._id;
  console.log(form);

  try {
    axios
      .post(process.env.POSTS_SERVICE_URL + "/posts", form)
      .then(function (response) {
        res.json(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
    console.log("Post posted to database");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
