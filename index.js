const express = require("express");
const mongoose = require("mongoose");
const UserModel = require("./models/user");
const sendAuthorizationEmail = require("./models/emailServices")
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 7000;

app.use(express.json());

mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log("Failed to connect to MongoDB", err));

// Test API
app.get("/", (req, res) => {
    res.json("Hello");
});

// Temporary storage for pending users
const pendingUsers = {};

// Create a new user (pending authorization)
app.post("/users", async (req, res) => {
    const newUser = new UserModel(req.body);
    pendingUsers[newUser.email] = newUser;

    try {
        await sendAuthorizationEmail(newUser);
        res.status(200).json({ message: "Registration request sent. Awaiting authorization." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Authorize the user
app.get("/authorize", async (req, res) => {
    const { email } = req.query;

    if (pendingUsers[email]) {
        try {
            await pendingUsers[email].save();
            delete pendingUsers[email];
            res.status(200).json({ message: "User authorized and saved to the database." });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } else {
        res.status(400).json({ message: "No pending user found with this email." });
    }
});

// Fetch all users
app.get("/users", async (req, res) => {
    try {
        const users = await UserModel.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`App is running at port ${PORT}`);
});
