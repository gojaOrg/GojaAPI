var axios = require("axios");
var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const multer = require("multer");
const upload = multer();
var FormData = require("form-data");
const { createSearchObj } = require("../utils/createSearchUserObj");

router.get("/profile/:id", auth, async (req, res) => {
  var userId;
  var route;
  if (req.params.id == "me") {
    userId = req.user._id;
    route = "/users/profile/" + userId;
  } else {
    me = req.user._id;
    userId = req.params.id;
    route = "/users/profile/" + userId + "/" + me;
  }
  axios({
    method: "get",
    url: process.env.USERS_SERVICE_URL + route,
  })
    .then(function (response) {
      res.json(response.data);
    })
    .catch(function (error) {
      res.status(error.response.status).json(error.response.data);
    });
});

router.get("/followers/:id", auth, async (req, res) => {
  var userId;
  if (req.params.id == "me") {
    userId = req.user._id;
  } else {
    userId = req.params.id;
  }
  axios({
    method: "get",
    url: process.env.USERS_SERVICE_URL + "/users/followers/" + userId,
  })
    .then(function (response) {
      res.json(response.data);
    })
    .catch(function (error) {
      res.status(error.response.status).json(error.response.data);
    });
});

router.get("/following/:id", auth, async (req, res) => {
  var userId;
  if (req.params.id == "me") {
    userId = req.user._id;
  } else {
    userId = req.params.id;
  }
  axios({
    method: "get",
    url: process.env.USERS_SERVICE_URL + "/users/following/" + userId,
  })
    .then(function (response) {
      res.json(response.data);
    })
    .catch(function (error) {
      res.status(error.response.status).json(error.response.data);
    });
});

router.post("/upload-image", auth, upload.any(), async function (req, res) {
  console.log(req);
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
  "/add-profile-picture",
  [
    body("url", "Invalid input").trim().isLength({
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
        .post(
          process.env.USERS_SERVICE_URL + "/users/add-profile-picture",
          form
        )
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
  "/add-profile-audio",
  [
    body("url", "Invalid input").trim().isLength({
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
        .post(process.env.USERS_SERVICE_URL + "/users/add-profile-audio", form)
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

router.get("/search", auth, async (req, res) => {
  const userId = req.user._id;
  const isFollowingList = await axios({
    method: "get",
    url: process.env.USERS_SERVICE_URL + "/users/following/" + userId,
  });
  const searchString = req.query.search;
  axios
    .get(process.env.USERS_SERVICE_URL + "/users/search", {
      params: { search: searchString },
    })
    .then((response) => {
      const ob = createSearchObj(isFollowingList.data, response.data);
      res.json(ob);
    })
    .catch((error) => {
      console.log(error);
      res.status(error.response.status).json(error.response.data);
    });
});

module.exports = router;
