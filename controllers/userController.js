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

    const user = await User.findById(_id).select("username");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const totalCountResult = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(_id) } },
      { $project: { count: { $size: "$log" } } },
    ]);
    const totalCount = totalCountResult[0]?.count || 0;

    const pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(_id) } },
      { $unwind: "$log" },
    ];

    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);
    if (Object.keys(dateFilter).length > 0) {
      pipeline.push({ $match: { "log.date": dateFilter } });
    }

    pipeline.push({ $sort: { "log.description": 1 } });

    if (limit) {
      pipeline.push({ $limit: Number(limit) });
    }

    pipeline.push({
      $project: {
        _id: 0,
        description: "$log.description",
        duration: "$log.duration",
        date: "$log.date",
      },
    });

    const logs = await User.aggregate(pipeline);

    res.json({
      _id: user._id,
      username: user.username,
      count: totalCount,
      log: logs.map((entry) => ({
        description: entry.description,
        duration: entry.duration,
        date: new Date(entry.date).toDateString(), // форматируем в JS
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createUser,
  addExercise,
  getUserLogs,
};
