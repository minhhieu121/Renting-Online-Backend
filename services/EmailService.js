const nodemailer = require('nodemailer');
const crypto = require('crypto');

class SimpleEmailService {
  constructor() {
    this.transporter = null;
  }

  async initialize() {
    if (!this.transporter) {
      // Create transporter using Gmail SMTP
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER, // Your Gmail address
          pass: process.env.GMAIL_APP_PASSWORD // Gmail App Password
        }
      });
    }
  }

  // Generate verification token
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate token expiry (24 hours from now)
  generateTokenExpiry() {
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  async sendVerificationEmail(userEmail, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3456'}/verify-email.html?token=${verificationToken}`;
    
    // Always log for debugging
    console.log('=== EMAIL VERIFICATION ===');
    console.log(`To: ${userEmail}`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log('========================');
    
    // Initialize Gmail transporter
    await this.initialize();
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: 'Verify Your Email Address - Renting Online',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Thank you for registering with Renting Online!</p>
          <p>Please click the button below to verify your email address:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          
          <p><strong>Important:</strong> This verification link will expire in 24 hours.</p>
          
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            If you didn't create an account with us, please ignore this email.
          </p>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent successfully to:', userEmail);
      return result;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(userEmail, resetToken) {
    const forceSend = process.env.SEND_EMAILS === 'true';

    // Force reset password to use backend port 3456 where the HTML file is served
    const resetUrl = `http://localhost:3456/reset-password.html?token=${resetToken}`;

    // In dev default we only log the URL. If SEND_EMAILS=true we will attempt to send via SMTP.
    if (process.env.NODE_ENV !== 'production' && !forceSend) {
      console.log('=== PASSWORD RESET ===');
      console.log(`To: ${userEmail}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log('=====================');
      return { messageId: 'dev-mode' };
    }

    await this.initialize();

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: 'Password Reset - Renting Online',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>We received a request to reset your password for your Renting Online account.</p>
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #ff6b6b; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          
          <p><strong>Important:</strong> This reset link will expire in 1 hour.</p>
          
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully to:', userEmail);
      return result;
    } catch (error) {
      // Log the error and also output the reset URL so you can copy it for testing
      console.error('Error sending password reset email:', error);
      console.log('Fallback - reset URL (copy to browser):', resetUrl);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendOrderEmail(userEmail, order) {
    const forceSend = process.env.SEND_EMAILS === 'true';

    const subject = `Order ${order.orderNumber} - Status: ${order.status}`;
    const orderUrl = `${process.env.FRONTEND_URL || 'http://localhost:3456'}/orders/${order.orderNumber}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
        <h2 style="color:#333;">Order Confirmation</h2>
        <p>Thank you for your order. Below are your order details:</p>
        <ul style="line-height:1.7;">
          <li><strong>Order Number:</strong> ${order.orderNumber}</li>
          <li><strong>Status:</strong> ${order.status}</li>
          <li><strong>Product ID:</strong> ${order.productId}</li>
          <li><strong>Quantity:</strong> ${order.quantity}</li>
          <li><strong>Total:</strong> ${typeof order.totalAmount !== 'undefined' ? order.totalAmount : ''}</li>
        </ul>
        <div style="margin: 24px 0;">
          <a href="${orderUrl}" style="background:#4CAF50;color:#fff;padding:10px 18px;text-decoration:none;border-radius:4px;display:inline-block;">View Order</a>
        </div>
        <p style="color:#666;font-size:12px;">If you did not place this order, please contact support.</p>
      </div>
    `;

    // In dev default, log instead of sending unless forced
    if (process.env.NODE_ENV !== 'production' && !forceSend) {
      console.log('=== ORDER EMAIL (dev) ===');
      console.log(`To: ${userEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(`Order URL: ${orderUrl}`);
      console.log('==========================');
      return { messageId: 'dev-mode' };
    }

    await this.initialize();

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject,
      html,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Order email sent successfully to:', userEmail);
      return result;
    } catch (error) {
      console.error('Error sending order email:', error);
      throw new Error('Failed to send order email');
    }
  }
}

module.exports = new SimpleEmailService();