const mongoose = require('mongoose');

const connectDB = () => {
    mongoose
        .connect(process.env.MONGO_URI, {
            connectTimeoutMS: 4000,
        })
        .then(() => console.log('MongoDB is connected'))
        .catch((err) => console.error('Error in connecting to DB:', err));
};

module.exports = connectDB;
