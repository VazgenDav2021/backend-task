const express = require("express");
const router = express.Router();
const {
  createUser,
  addExercise,
  getUserLogs,
} = require("../controllers/userController");

router.post("/api/users", createUser);
router.post("/api/users/:_id/exercises", addExercise);
router.get("/api/users/:_id/logs", getUserLogs);

module.exports = router;
