// server.js
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

// Load .env secrets
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

// Mongoose Schema
const InvestorSchema = new mongoose.Schema({
  episode: String,
  fullName: String,
  address: String,
  company: String,
  email: String,
  phone: String,
  kvk: String,
  date: { type: Date, default: Date.now },
});
const Investor = mongoose.model('Investor', InvestorSchema);

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Handle form submission
app.post('/submit', async (req, res) => {
  try {
    console.log("POST /submit hit"); // Debug
    const { episode, fullName, address, company, email, phone, kvk } = req.body;
    console.log("Form data:", req.body); // Debug

    const newInvestor = new Investor({ episode, fullName, address, company, email, phone, kvk });
    await newInvestor.save();
    console.log("Saved to MongoDB"); // Debug

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Turning Point TV Series – Investment Confirmation',
      html: `<p>Dear ${fullName},</p>
             <p>Thank you for funding <strong>${episode}</strong> of the Turning Point TV Series.</p>
             <p>Your details have been securely received.</p>
             <p>– Turning Point Production Team</p>`
    };
    await transporter.sendMail(mailOptions);
    console.log("Email sent!"); // Debug

    res.status(200).json({ message: 'Submitted successfully!' });
  } catch (error) {
    console.error('❌ SERVER ERROR:', error); // <-- this is critical!
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});


// Mollie API integration — for LIVE donation chart
app.get('/api/donations', async (req, res) => {
  try {
    const response = await axios.get('https://api.mollie.com/v2/payments', {
      headers: { Authorization: `Bearer ${process.env.MOLLIE_API_KEY}` }
    });
    // Only show successful (paid) donations
    const paid = response.data._embedded.payments.filter(p => p.status === 'paid');
    res.json(paid);
  } catch (error) {
    console.error('❌ Mollie API Error:', error.message);
    res.status(500).json({ error: 'Error fetching donations from Mollie' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
