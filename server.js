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
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

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

    // Save to MongoDB
    const newInvestor = new Investor({ episode, fullName, address, company, email, phone, kvk });
    await newInvestor.save();

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

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Submitted successfully!' });
  } catch (error) {
    console.error('❌ Error submitting form:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
