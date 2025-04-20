const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Task = require("../models/Exercise");

router.get("/", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const taskCount = await Task.countDocuments();

    res.render("home", {
      title: "Home Page",
      isHome: true,
      userCount,
      taskCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
