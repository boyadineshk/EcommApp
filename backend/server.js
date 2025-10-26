// backend/server.js - SECURE VERSION WITH ENV VARIABLES
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
    message: '✅ Ecommerce Email Server is Running with Gmail!',
    timestamp: new Date().toISOString(),
    status: 'Active',
    email: process.env.GMAIL_USER || 'Not configured',
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
    service: 'Gmail Email Service',
    email: process.env.GMAIL_USER || 'Not configured',
    time: new Date().toISOString()
  });
});

// Configure Gmail transporter with ENVIRONMENT VARIABLES
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verify email config
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Gmail configuration error:', error);
  } else {
    console.log('✅ Gmail server is ready to send messages');
    console.log('📧 Connected to:', process.env.GMAIL_USER);
  }
});

const FROM_NAME = `"Ecomm Store" <${process.env.GMAIL_USER}>`;

// 1️⃣ REGISTRATION EMAIL
app.post('/api/send-registration', async (req, res) => {
  try {
    const { to, username } = req.body;

    console.log('📧 Sending registration email to:', to);

    if (!to || !username) {
      return res.status(400).json({ success: false, error: 'Email and username are required' });
    }

    const mailOptions = {
      from: FROM_NAME,
      to: to,
      subject: '🎉 Welcome to Ecomm Store - Account Created Successfully!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Ecomm Store! 🎉</h1>
          </div>

          <div style="padding: 30px;">
            <h2 style="color: #333;">Hello ${username}! 👋</h2>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Your account has been <strong>successfully created</strong> on our Ecommerce Store.
            </p>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">🎯 What you can do now:</h3>
              <ul style="color: #555;">
                <li>🛍️ Browse thousands of products</li>
                <li>💳 Secure checkout process</li>
                <li>📦 Fast delivery options</li>
                <li>⭐ Save items to wishlist</li>
              </ul>
            </div>

            <p style="font-size: 16px; color: #555;">
              Start exploring amazing products and enjoy a seamless shopping experience!
            </p>

            <div style="text-align: center; margin-top: 30px;">
              <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Start Shopping Now
              </a>
            </div>
          </div>

          <div style="background: #2c3e50; color: white; text-align: center; padding: 20px;">
            <p style="margin: 0; font-size: 14px;">Thank you for choosing Ecomm Store!</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">
              © 2024 Ecomm Store. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Registration email sent to:', to);
    res.json({
      success: true,
      message: 'Registration email sent successfully!',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Registration email error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Failed to send registration email'
    });
  }
});

// 2️⃣ LOGIN EMAIL
app.post('/api/send-login', async (req, res) => {
  try {
    const { to, username } = req.body;

    console.log('📧 Sending login notification to:', to);

    if (!to || !username) {
      return res.status(400).json({ success: false, error: 'Email and username are required' });
    }

    const loginTime = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'long'
    });

    const mailOptions = {
      from: FROM_NAME,
      to: to,
      subject: '🔐 Login Successful - Ecomm Store',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 25px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Login Successful 🔐</h1>
          </div>

          <div style="padding: 25px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${username}! 👋</h2>

            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #38ef7d;">
              <p style="margin: 0; color: #2d5016; font-weight: bold;">
                ✅ You successfully logged into your Ecomm Store account
              </p>
              <p style="margin: 5px 0 0 0; color: #555;">
                <strong>Time:</strong> ${loginTime}
              </p>
            </div>

            <p style="color: #666; margin-top: 20px;">
              <strong>Device:</strong> Mobile App<br>
              <strong>Location:</strong> India
            </p>

            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;">
                <strong>⚠️ Security Notice:</strong> If this wasn't you, please change your password immediately.
              </p>
            </div>
          </div>

          <div style="background: #2c3e50; color: white; text-align: center; padding: 15px;">
            <p style="margin: 0; font-size: 12px;">
              © 2024 Ecomm Store. Keeping your account secure.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Login notification sent to:', to);
    res.json({
      success: true,
      message: 'Login notification sent successfully!',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('❌ Login email error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Failed to send login notification'
    });
  }
});

// 3️⃣ ORDER SUCCESS EMAIL
app.post('/api/send-order-success', async (req, res) => {
  try {
    const { to, user, order } = req.body;

    console.log('📧 Sending order confirmation to:', to);

    if (!to || !user || !order) {
      return res.status(400).json({ success: false, error: 'Missing order information' });
    }

    const orderDate = new Date(order.date).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    // Calculate item details
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: FROM_NAME,
      to: to,
      subject: `✅ Order Confirmed - #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed! ✅</h1>
            <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">Order #${order.id}</p>
          </div>

          <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${user.username}! 👋</h2>
            <p style="color: #555; font-size: 16px;">
              Thank you for your purchase! Your order has been confirmed and is being processed.
            </p>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">📦 Order Summary</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #e9ecef;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #ddd;">
                <div style="display: flex; justify-content: space-between; font-weight: bold;">
                  <span>Total Amount:</span>
                  <span>₹${order.total.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: #27ae60; margin-top: 5px;">
                  <span>Status:</span>
                  <span>✅ Confirmed</span>
                </div>
              </div>
            </div>

            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db;">
              <p style="margin: 0; color: #2c3e50;">
                <strong>📅 Order Date:</strong> ${orderDate}<br>
                <strong>🚚 Expected Delivery:</strong> 3-5 business days
              </p>
            </div>
          </div>

          <div style="background: #27ae60; color: white; text-align: center; padding: 20px;">
            <p style="margin: 0; font-size: 16px; font-weight: bold;">Thank you for shopping with us! 🎉</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">
              We'll notify you when your order ships.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation sent to:', to);
    res.json({
      success: true,
      message: 'Order confirmation email sent successfully!',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('❌ Order success email error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Failed to send order confirmation'
    });
  }
});

// 4️⃣ ORDER FAILURE EMAIL
app.post('/api/send-order-failure', async (req, res) => {
  try {
    const { to, user, order, reason } = req.body;

    console.log('📧 Sending order failure notification to:', to);

    if (!to || !user || !order) {
      return res.status(400).json({ success: false, error: 'Missing details' });
    }

    const mailOptions = {
      from: FROM_NAME,
      to: to,
      subject: `❌ Order Failed - #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 25px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Order Failed ❌</h1>
          </div>

          <div style="padding: 25px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${user.username},</h2>

            <div style="background: #fde8e8; padding: 15px; border-radius: 8px; border-left: 4px solid #e74c3c;">
              <p style="margin: 0; color: #c0392b; font-weight: bold;">
                We encountered an issue with your order
              </p>
              <p style="margin: 5px 0 0 0; color: #666;">
                <strong>Reason:</strong> ${reason || 'Payment processing failed'}
              </p>
            </div>

            <p style="color: #555; margin-top: 20px;">
              <strong>Good news:</strong> No money has been deducted from your account.
            </p>

            <div style="text-align: center; margin-top: 25px;">
              <a href="#" style="background: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Try Order Again
              </a>
            </div>

            <p style="color: #666; margin-top: 20px; font-size: 14px;">
              If you continue to experience issues, please contact our support team.
            </p>
          </div>

          <div style="background: #2c3e50; color: white; text-align: center; padding: 15px;">
            <p style="margin: 0; font-size: 12px;">
              © 2024 Ecomm Store. We're here to help.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Order failure notification sent to:', to);
    res.json({
      success: true,
      message: 'Order failure notification sent successfully!',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('❌ Order failure email error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Failed to send order failure notification'
    });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 GMAIL EMAIL SERVER STARTED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log(`📍 Deployed URL: https://ecomm-backend-4ec9.onrender.com`);
  console.log(`📧 Using Gmail: ${process.env.GMAIL_USER}`);
  console.log('='.repeat(60));
  console.log('📋 Available Endpoints:');
  console.log('   POST /api/send-registration');
  console.log('   POST /api/send-login');
  console.log('   POST /api/send-order-success');
  console.log('   POST /api/send-order-failure');
  console.log('='.repeat(60) + '\n');
});