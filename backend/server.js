// backend/server.js - FINAL VERSION (With Custom Admin Name & Port Config)
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
  res.json({
    message: '✅ Ecommerce Email Server is Running!',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'POST /api/send-registration',
      'POST /api/send-login',
      'POST /api/send-order-success',
      'POST /api/send-order-failure'
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Email Service',
    time: new Date().toISOString()
  });
});

// Configure transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS, // app password
  },
});

// Verify email config
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

const FROM_NAME = '"Dinesh Ecommm Admin"'; // 👈 custom sender name

// 1️⃣ REGISTRATION EMAIL
app.post('/api/send-registration', async (req, res) => {
  try {
    const { to, username } = req.body;

    if (!to || !username)
      return res.status(400).json({ success: false, error: 'Email and username are required' });

    const mailOptions = {
      from: `${FROM_NAME} <${process.env.EMAIL_USER}>`,
      to,
      subject: '🎉 Account Created Successfully - Welcome to Ecommerce App!',
      html: `
        <div style="font-family: Arial, sans-serif; background: #f9f9f9; max-width: 600px; margin:auto;">
          <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 40px; text-align:center;">
            <h1 style="color:white;">🎉 Welcome Aboard!</h1>
          </div>
          <div style="background:white; padding:30px;">
            <h2>Hello ${username}! 👋</h2>
            <p>Your account has been <strong>successfully created</strong> on our Ecommerce App.</p>
            <p>🛍️ Start exploring amazing products and enjoy secure shopping!</p>
          </div>
          <div style="background:#2c3e50; color:white; text-align:center; padding:20px;">
            <p>Thank you for choosing us!</p>
            <p style="font-size:12px;">© 2025 Ecommerce App. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Registration email sent:', info.messageId);
    res.json({ success: true, message: 'Registration email sent successfully!' });

  } catch (error) {
    console.error('❌ Registration email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2️⃣ LOGIN EMAIL
app.post('/api/send-login', async (req, res) => {
  try {
    const { to, username } = req.body;
    if (!to || !username)
      return res.status(400).json({ success: false, error: 'Email and username are required' });

    const loginTime = new Date().toLocaleString();
    const mailOptions = {
      from: `${FROM_NAME} <${process.env.EMAIL_USER}>`,
      to,
      subject: '🔐 Login Successful - Ecommerce App',
      html: `
        <div style="font-family: Arial; background:#f9f9f9; max-width:600px; margin:auto;">
          <div style="background:linear-gradient(135deg,#11998e,#38ef7d);padding:30px;text-align:center;">
            <h1 style="color:white;">🔐 Login Successful</h1>
          </div>
          <div style="background:white;padding:30px;">
            <h2>Hello ${username}! 👋</h2>
            <p>You logged in successfully on <strong>${loginTime}</strong>.</p>
            <p>If this wasn’t you, please change your password immediately.</p>
          </div>
          <div style="background:#2c3e50;color:white;text-align:center;padding:20px;">
            <p style="font-size:12px;">© 2025 Ecommerce App. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Login email sent:', info.messageId);
    res.json({ success: true, message: 'Login email sent successfully!' });
  } catch (error) {
    console.error('❌ Login email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3️⃣ ORDER SUCCESS EMAIL
app.post('/api/send-order-success', async (req, res) => {
  try {
    const { to, user, order } = req.body;
    if (!to || !user || !order)
      return res.status(400).json({ success: false, error: 'Missing order info' });

    const itemsHtml = order.items.map(i => `
      <tr><td>${i.title}</td><td>${i.quantity}</td><td>₹${i.price}</td></tr>
    `).join('');

    const mailOptions = {
      from: `${FROM_NAME} <${process.env.EMAIL_USER}>`,
      to,
      subject: `✅ Order Confirmed - #${order.id}`,
      html: `
        <div style="font-family:Arial;background:#f9f9f9;max-width:600px;margin:auto;">
          <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:40px;text-align:center;">
            <h1 style="color:white;">✅ Order Confirmed!</h1>
          </div>
          <div style="background:white;padding:30px;">
            <h2>Hi ${user.username}! 👋</h2>
            <p>Thank you for shopping with us. Your order is confirmed!</p>
            <table style="width:100%;border-collapse:collapse;">${itemsHtml}</table>
            <p><strong>Total: ₹${order.total}</strong></p>
          </div>
          <div style="background:#2c3e50;color:white;text-align:center;padding:20px;">
            <p style="font-size:12px;">© 2025 Ecommerce App. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Order success email sent:', info.messageId);
    res.json({ success: true, message: 'Order success email sent successfully!' });
  } catch (error) {
    console.error('❌ Order success email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4️⃣ ORDER FAILURE EMAIL
app.post('/api/send-order-failure', async (req, res) => {
  try {
    const { to, user, order, reason } = req.body;
    if (!to || !user || !order)
      return res.status(400).json({ success: false, error: 'Missing details' });

    const mailOptions = {
      from: `${FROM_NAME} <${process.env.EMAIL_USER}>`,
      to,
      subject: `❌ Order Failed - #${order.id}`,
      html: `
        <div style="font-family:Arial;background:#f9f9f9;max-width:600px;margin:auto;">
          <div style="background:linear-gradient(135deg,#e74c3c,#c0392b);padding:40px;text-align:center;">
            <h1 style="color:white;">❌ Order Failed</h1>
          </div>
          <div style="background:white;padding:30px;">
            <h2>Hi ${user.username},</h2>
            <p>Your order failed due to: <strong>${reason || 'Payment issue'}</strong></p>
            <p>No money has been deducted. Please try again.</p>
          </div>
          <div style="background:#2c3e50;color:white;text-align:center;padding:20px;">
            <p style="font-size:12px;">© 2025 Ecommerce App. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Order failure email sent:', info.messageId);
    res.json({ success: true, message: 'Order failure email sent successfully!' });
  } catch (error) {
    console.error('❌ Order failure email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 Email Server Started Successfully!');
  console.log('='.repeat(50));
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Network: http://10.251.145.69:${PORT}`);
  console.log(`📧 Health check: http://localhost:${PORT}/health`);
  console.log('='.repeat(50) + '\n');
});
