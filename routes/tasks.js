const express = require("express");
const router = express.Router();
const formatUsersData = require("../utils/formatUsersData");
const User = require("../models/User");
const Task = require("../models/Exercise");

router.get("/tasks", async (req, res) => {
  try {
    const allTasks = await Task.find({}).populate("userId").lean();
    const formatedTasks = formatUsersData(allTasks);
    const usersArrayIsEmpty = await User.countDocuments();
    
    allTasks
      .filter((each) => !each.userId)
      .forEach(async (el) => {
        await Task.deleteOne({ _id: el._id });
      });

    res.render("tasks", {
      title: "Tasks",
      isTasks: true,
      allTasks: formatedTasks,
      message: "Here can be dynamic message",
      usersArrayIsEmpty: !usersArrayIsEmpty,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.get("/task/create", async (req, res) => {
  try {
    const allUsers = await User.find({}).lean();
    res.render("createTask", {
      title: "Create a new task",
      allUsers,
      isUser: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.post("/task/create", async (req, res) => {
  try {
    const { userId, duration, exersize } = req.body;
    const newExersize = await Task.create({
      date: new Date().toISOString(),
      description: exersize,
      userId,
      duration,
    });

    await User.findByIdAndUpdate(userId, {
      $push: { exercises: newExersize._id },
    });

    await newExersize.save();

    if (!userId || !duration || !exersize) {
      return res.status(400).send("One of values are invalid or empty");
    }

    res.redirect("/tasks");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
