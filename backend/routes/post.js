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

router.get("/my-posts", auth, async (req, res) => {
  var userId = req.user._id;
  console.log(userId);
  axios({
    method: "get",
    url: process.env.POSTS_SERVICE_URL + "/posts/my-posts/" + userId,
  })
    .then(function (response) {
      res.json(response.data);
    })
    .catch(function (error) {
      res.status(error.response.status).json(error.response.data);
    });
});

router.get("/all", auth, async (req, res) => {
  var userId = req.user._id;
  console.log(userId);
  axios({
    method: "get",
    url: process.env.POSTS_SERVICE_URL + "/posts/all",
  })
    .then(function (response) {
      res.json(response.data);
    })
    .catch(function (error) {
      res.status(error.response.status).json(error.response.data);
    });
});

router.get("/more/:minDate", auth, async (req, res) => {
  var userId = req.user._id;
  console.log(userId);
  axios({
    method: "get",
    url: process.env.POSTS_SERVICE_URL + "/posts/more/" + req.params.minDate,
  })
    .then(function (response) {
      res.json(response.data);
    })
    .catch(function (error) {
      res.status(error.response.status).json(error.response.data);
    });
});

router.get("/replies/:id", auth, async (req, res) => {
  axios({
    method: "get",
    url: process.env.POSTS_SERVICE_URL + "/posts/replies/" + req.params.id,
  })
    .then(function (response) {
      res.json(response.data);
    })
    .catch(function (error) {
      res.status(error.response.status).json(error.response.data);
    });
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
router.post("/upload-audio", auth, upload.any(), async function (req, res) {
  const { headers, files } = req;
  const { buffer, originalname: filename } = files[0];
  console.log(filename);

  let formData = new FormData();
  formData.append("file", buffer, { filename });

  const config = { header: { "Content-Type": "multipart/form-data" } };
  axios
    .post(process.env.POSTS_SERVICE_URL + "/posts/upload-audio", formData, {
      headers: formData.getHeaders(),
    })
    .then((response) => {
      // Respond with AWS S3 URL
      res.json(response.data);
    })
    .catch(function (error) {
      res.status(error.response.status).json(error.response.data);
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
        res.status(error.response.status).json(error.response.data);
      });
    console.log("Post posted to database");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/like", auth, async (req, res) => {
  const id = req.user._id;
  const body = req.body;
  const likeOrUnlike = body.likeType;
  let likePath;
  let likeBody = {
    id: body.postId,
    user: { userId: id, userName: body.user.userName },
  };
  console.log(likeBody);
  if (likeOrUnlike) {
    likePath = "/posts/like";
  } else {
    likePath = "/posts/unlike";
  }
  try {
    axios
      .post(process.env.POSTS_SERVICE_URL + likePath, likeBody)
      .then((response) => {
        res.json(response.data);
      })
      .catch((error) => {
        console.log(error.response.status);
        res
          .status(error.response.status)
          .json({ message: error.response.data });
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
