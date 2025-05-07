const { default: mongoose } = require("mongoose");
const User = require("../models/User");

const createUser = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

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

    if (duration === undefined || duration === null || duration === "") {
      return res.status(400).json({ error: "Duration is required" });
    }

    const transformedDuration = Number(duration);

    if (isNaN(transformedDuration) || transformedDuration < 0) {
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

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ error: "User not found" });

    let logs = user.log.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (from) {
      const fromDate = new Date(from);
      logs = logs.filter((entry) => new Date(entry.date) >= fromDate);
    }

    if (to) {
      const toDate = new Date(to);
      logs = logs.filter((entry) => new Date(entry.date) <= toDate);
    }

    const count = logs.length;

    if (limit) {
      logs = logs.slice(0, Number(limit));
    }

    logs = logs.sort((a, b) => a.description.localeCompare(b.description));

    res.json({
      _id: user._id,
      username: user.username,
      count,
      log: logs.map((entry) => ({
        description: entry.description,
        duration: entry.duration,
        date: new Date(entry.date).toDateString(),
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
