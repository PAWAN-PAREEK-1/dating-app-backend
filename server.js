const express = require('express');
const connectDb = require('./config/connectDb'); // Ensure the path is correct
const dotenv = require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to the database
connectDb();

app.use(express.json());

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
