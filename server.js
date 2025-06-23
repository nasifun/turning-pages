// server.js
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MongoDB Connection
// Modern Mongoose connection without deprecated options
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

// Route to handle form submission
app.post('/submit', async (req, res) => {
  try {
    const { episode, fullName, address, company, email, phone, kvk } = req.body;

    console.log("📩 Received submission:", req.body);

    // Save to MongoDB
    const newInvestor = new Investor({ episode, fullName, address, company, email, phone, kvk });

    try {
      await newInvestor.save();
      console.log("✅ Saved to MongoDB");
    } catch (mongoError) {
      console.error("❌ MongoDB Save Error:", mongoError);
      return res.status(500).json({ error: 'Failed to save to MongoDB' });
    }

    // Send confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Turning Point TV Series – Investment Confirmation',
      html: `<p>Dear ${fullName},</p>
             <p>Thank you for funding <strong>${episode}</strong> of the Turning Point TV Series.</p>
             <p>Your details have been securely received.</p>
             <p>– Turning Point Production Team</p>`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("📧 Confirmation email sent");
    } catch (mailError) {
      console.error("❌ Email Send Error:", mailError);
      return res.status(500).json({ error: 'Failed to send confirmation email' });
    }

    res.status(200).json({ message: 'Submitted successfully!' });

  } catch (error) {
    console.error('❌ General Server Error:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});


// Mollie API integration
const axios = require('axios'); // Make sure this is at the top with your other requires

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


const axios = require('axios'); // Place this near your other 'require' lines

// Live Mollie API endpoint (paid donations only)
app.get('/api/donations', async (req, res) => {
  try {
    const response = await axios.get('https://api.mollie.com/v2/payments', {
      headers: { Authorization: `Bearer ${process.env.MOLLIE_API_KEY}` }
    });
    // Filter only PAID donations
    const paid = response.data._embedded.payments.filter(p => p.status === 'paid');
    res.json(paid);
  } catch (error) {
    console.error('❌ Mollie API Error:', error.message);
    res.status(500).json({ error: 'Error fetching donations from Mollie' });
  }
});


