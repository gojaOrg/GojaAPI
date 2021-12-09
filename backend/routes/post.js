var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
var axios = require("axios");
const multer = require("multer");
const upload = multer();
var FormData = require("form-data");

router.get("/by-user/:id", auth, async (req, res) => {
  var userId;
  if (req.params.id == "me") {
    userId = req.user._id;
  } else {
    userId = req.params.id;
  }
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

router.get("/my-feed", auth, async (req, res) => {
  var userId = req.user._id;
  console.log(userId);
  var response = await axios({
    method: "get",
    url:
      process.env.USERS_SERVICE_URL + "/users/following-for-my-feed/" + userId,
  });
  let data = {
    following: response.data,
    userId: userId,
  };
  axios({
    method: "post",
    url: process.env.POSTS_SERVICE_URL + "/posts/my-feed",
    data: data,
  })
    .then(function (response) {
      // your action after success
      res.json(response.data);
    })
    .catch(function (error) {
      // your action on error success
      res.json(error);
      console.log(error);
    });
});

router.get("/my-feed/more/:minDate", auth, async (req, res) => {
  var userId = req.user._id;
  req.body.minDate = req.params.minDate;
  var response = await axios({
    method: "get",
    url:
      process.env.USERS_SERVICE_URL + "/users/following-for-my-feed/" + userId,
  });
  let data = {
    following: response.data,
    minDate: req.body.minDate,
    userId: userId,
  };
  axios({
    method: "post",
    url: process.env.POSTS_SERVICE_URL + "/posts/my-feed/more",
    data: data,
  })
    .then(function (response) {
      // your action after success
      res.json(response.data);
    })
    .catch(function (error) {
      // your action on error success
      res.json(error);
      console.log(error);
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
  form.user.id = req.user._id;
  try {
    var response = await axios
      .post(process.env.POSTS_SERVICE_URL + "/posts", form)
      .catch(function (error) {
        res.status(error.response.status).json(error.response.data);
      });
    if (response.status == 200) {
      axios
        .post(
          process.env.USERS_SERVICE_URL + "/users/update-post-count",
          form.user
        )
        .then(function (response) {
          res.json(response.data);
        })
        .catch(function (error) {
          res.status(error.response.status).json(error.response.data);
        });
      console.log("Post posted to database");
    } else {
      res.send("Something went wrong");
    }
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
