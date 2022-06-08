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

router.get("/by-id/:id", auth, async (req, res) => {
  axios({
    method: "get",
    url: process.env.POSTS_SERVICE_URL + "/posts/by-id/" + req.params.id,
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
  axios({
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
  try {
    var response = await axios({
      method: "get",
      url:
        process.env.USERS_SERVICE_URL +
        "/users/following-for-my-feed/" +
        userId,
    });
    if (response.status == 200) {
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
          //console.log(error);
        });
    } else {
      res.send("Error");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/my-feed/more/:minDate", auth, async (req, res) => {
  var userId = req.user._id;
  try {
    req.body.minDate = req.params.minDate;
    var response = await axios({
      method: "get",
      url:
        process.env.USERS_SERVICE_URL +
        "/users/following-for-my-feed/" +
        userId,
    });
    if (response.status == 200) {
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
    } else {
      res.send("Error");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
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

router.get("/hashtag", auth, async (req, res) => {
  const userId = req.user._id;
  const searchString = req.query.search;
  axios
    .get(process.env.POSTS_SERVICE_URL + "/posts/hashtag", {
      params: { search: searchString },
    })
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      console.log(error);
      res.status(error.response.status).json(error.response.data);
    });
});

router.get("/search-hashtag", auth, async (req, res) => {
  const userId = req.user._id;
  const searchString = req.query.search;
  axios
    .get(process.env.POSTS_SERVICE_URL + "/posts/search-hashtag", {
      params: { search: searchString },
    })
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      console.log(error);
      res.status(error.response.status).json(error.response.data);
    });
});

router.post(
  "/add-jobpictures",
  upload.array("photos", 12),
  function (req, res) {
    var fileLocations = [];
    for (i = 0; i < req.files.length; i++) {
      fileLocations.push(req.files[i].location);
    }
    res.json(fileLocations);
  }
);
router.post("/upload-audio", auth, upload.any(), async function (req, res) {
  const { headers, files } = req;
  const { buffer, originalname: filename } = files[0];

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
    await axios
      .post(process.env.POSTS_SERVICE_URL + "/posts", form)
      .then(function (response) {
        if (response.status == 200) {
          console.log("heeere");
          if (!form.inReplyToPostId) {
            const updateResponse = axios
              .post(
                process.env.USERS_SERVICE_URL + "/users/update-post-count",
                form.user
              )
              .catch(function (error) {
                console.log(error);
                res.status(error.response.status).json(error.response.data);
              });
          }
          console.log(response.data);
          res.json(response.data);
        } else {
          res.send("Something went wrong");
        }
      })
      .catch(function (error) {
        res.status(error.response.status).json(error.response.data);
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/like", auth, async (req, res) => {
  const id = req.user._id;
  const body = req.body;

  let likeBody = {
    id: body.postId,
    user: { id: id, userName: body.user.userName },
  };

  try {
    axios
      .post(process.env.POSTS_SERVICE_URL + "/posts/like", likeBody)
      .then((response) => {
        console.log(response.data);
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

router.post("/unlike", auth, async (req, res) => {
  const id = req.user._id;
  const body = req.body;
  let likeBody = {
    id: body.postId,
    user: { id: id, userName: body.user.userName },
  };
  try {
    axios
      .post(process.env.POSTS_SERVICE_URL + "/posts/unlike", likeBody)
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
