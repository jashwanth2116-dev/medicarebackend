const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Replace YOUR_PASSWORD_HERE with your real database password
const MONGO_URI = "mongodb+srv://jashwanth2116_db_user:jashwanth2116@cluster0.rmoczf2.mongodb.net/medicareDB?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
    userEmail: String,
    doctorName: String,
    date: String,
    slot: String,
    createdAt: { type: Date, default: Date.now }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

// 1. Dynamic User Signup
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered! Please Login." });
        }
        const newUser = new User({ email, password });
        await newUser.save();
        res.status(201).json({ success: true, message: "Account created successfully! Now Login." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Registration failed." });
    }
});

// 2. Strict Real User Login API
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password!" });
        }
        res.status(200).json({ success: true, message: "Login successful!", user: { email: user.email } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error during login." });
    }
});

// 3. Book Appointment API
app.post('/api/book-appointment', async (req, res) => {
    try {
        const { userEmail, doctor, date, slot } = req.body;
        const newApp = new Appointment({ userEmail, doctorName: doctor, date, slot });
        await newApp.save();
        res.status(200).json({ success: true, message: `Appointment confirmed with ${doctor} on ${date} (${slot})` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Booking failed." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
