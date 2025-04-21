require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const configureHandlebars = require('./config/handlebars');

const homeRoutes = require('./routes/home');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');

const app = express();

connectDB();

configureHandlebars(app);

app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
});



app.use(homeRoutes);
app.use(userRoutes);
app.use(taskRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
