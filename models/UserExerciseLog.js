const mongoose = require('mongoose');
const User = require('./User'); 
const Exercise = require('./Exercise'); 

const userExerciseLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    logs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Exercise 
    }],
    count: {
        type: Number,
        required: true,
        default: 0
    }
});

const UserExerciseLog = mongoose.model('UserExerciseLog', userExerciseLogSchema);
module.exports = UserExerciseLog;
