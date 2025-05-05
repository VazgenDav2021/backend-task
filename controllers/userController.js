const { default: mongoose } = require("mongoose");
const User = require("../models/User");

const createUser = async (req, res) => {
  try {
    const { username } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const newUser = new User({ username });
    await newUser.save();
    res.json({ username: newUser.username, _id: newUser._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addExercise = async (req, res) => {
  try {
    const { _id } = req.params;
    const { description, duration, date } = req.body;
    const transformedDuration = Math.abs(parseInt(duration || 0));

    if (isNaN(transformedDuration) || transformedDuration <= 0) {
      return res.status(400).json({ error: "Invalid duration" });
    }

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const exercise = {
      description,
      duration: transformedDuration,
      date: date ? new Date(date) : new Date(),
    };

    user.log.push(exercise);
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      date: exercise.date.toDateString(),
      duration: exercise.duration,
      description: exercise.description,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserLogs = async (req, res) => {
  try {
    const { _id } = req.params;
    const { from, to, limit } = req.query;

    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ error: "User not found" });

    let log = [...user.log];

    if (from) {
      const fromDate = new Date(from);
      log = log.filter((e) => new Date(e.date) >= fromDate);
    }

    if (to) {
      const toDate = new Date(to);
      log = log.filter((e) => new Date(e.date) <= toDate);
    }

    if (limit) {
      log = log.slice(0, parseInt(limit));
    }

    res.json({
      _id: user._id,
      username: user.username,
      count: log.length,
      log: log.map((e) => ({
        description: e.description,
        duration: e.duration,
        date: new Date(e.date).toDateString(),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createUser,
  addExercise,
  getUserLogs,
};
