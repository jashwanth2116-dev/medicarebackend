const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());

// In-Memory Database (MongoDB thevai illai, server memory-laye data store aagum)
const users = [];
const bookings = [];

// Root Route
app.get('/', (req, res) => {
  res.send('Medicare Backend Server is Running (In-Memory Mode)!');
});

// Register Endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and Password required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = users.find(u => u.email === cleanEmail);

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please login!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ email: cleanEmail, password: hashedPassword });

    res.json({ success: true, message: 'Registration Successful!' });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and Password required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = users.find(u => u.email === cleanEmail);

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found. Please register first!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid Email or Password.' });
    }

    res.json({ success: true, email: user.email, message: 'Login successful!' });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// Booking Endpoint
app.post('/api/book', async (req, res) => {
  try {
    const { email, doctorName, date, timeSlot } = req.body;
    
    const doctorBookings = bookings.filter(b => b.doctorName === doctorName && b.date === date);
    const tokenNumber = doctorBookings.length + 1;

    const newBooking = { email, doctorName, date, timeSlot, tokenNumber };
    bookings.push(newBooking);

    res.json({ success: true, tokenNumber });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Booking failed' });
  }
});

// Queue Status Endpoint
app.get('/api/queue-status', async (req, res) => {
  try {
    const { doctorName, date } = req.query;
    const doctorBookings = bookings.filter(b => b.doctorName === doctorName && b.date === date);
    doctorBookings.sort((a, b) => a.tokenNumber - b.tokenNumber);
    
    const currentToken = doctorBookings.length > 0 ? 1 : 0;

    res.json({ success: true, currentToken, totalBookings: doctorBookings.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching queue' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} (Without MongoDB)`));
