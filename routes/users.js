const express = require("express");
const User = require("../models/User");
const formatUsersData = require("../utils/formatUsersData");
const router = express.Router();

router.get("/users", async (req, res) => {
  try {
    const users = await User.find().lean();
    const formatedUsers = formatUsersData(users);
    res.render("users", {
      title: "Users",
      isUser: true,
      users: formatedUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.get("/users/create", async (req, res) => {
  try {
    res.render("createUser", {
      title: "Create new User",
      isUser: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.post("/users/create", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).send("Name is required");
    }

    const newUser = new User({
      username: username,
    });

    await newUser.save();

    res.redirect("/users");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const {
      params: { id: userId },
    } = req;
    const currentUser = await User.findById(userId)
      .populate("exercises")
      .lean();

    if (!currentUser) {
      return res.redirect("/users");
    }

    const title = `Profile-${currentUser.username}`;

    res.render("currentUser", {
      isUser: true,
      currentUser,
      title,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});


module.exports = router;
