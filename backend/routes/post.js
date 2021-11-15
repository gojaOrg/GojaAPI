var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const auth = require("../middleware/auth");
const Post = require("../models/postModel");
const mongoose = require("mongoose");
const upload = require("../middleware/imageUpload");
const ObjectId = mongoose.Types.ObjectId;
var axios = require("axios");

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
router.post(
  "/add-audio",
  upload.single("audio"),
  auth,
  async function (req, res) {
    var id = req.user._id;
    res.json(req.file.location);
  }
);
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

router.post("/like", async (req, res) => {
  console.log("POSTING LIKES");
  const body = req.body;
  const likeOrUnlike = body.likeType;
  let likePath;
  let likeBody = {
    id: body.postId,
    user: { userId: body.user.id, userName: body.user.userName },
  };
  if (likeOrUnlike) {
    likePath = "/like";
  } else {
    likePath = "/unlike";
  }
  console.log(likeBody);
  try {
    console.log("TRYING TO POST");
    axios
      .post("http://localhost:3002/posts" + likePath, likeBody)
      .then((response) => {
        res.json(response.data);
        console.log("Liking updated on post");
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
