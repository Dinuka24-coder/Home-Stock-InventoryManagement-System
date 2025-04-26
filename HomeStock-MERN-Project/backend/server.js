const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require("path");

const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatbotRoute = require("./routes/chatbot");
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded images
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/expenses", require("./routes/expensesRoutes"));

// Routes
app.use('/api/users', userRoutes);
app.use("/api/chatbot", chatbotRoute);
app.use('/api/auth', authRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});