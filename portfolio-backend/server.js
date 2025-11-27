
// server.js
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

// Load .env from the same directory as this server.js file
require("dotenv").config({ path: path.join(__dirname, '.env') });

// 1) Create app FIRST
const app = express();

// 2) Middleware
app.use(express.json()); // replaces body-parser
app.use(cors());

// 3) Health check
app.get("/health", (req, res) => res.status(200).send("OK"));

// 4) Contact route
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;
  console.log("Incoming /send:", { name, email, hasMessage: !!message });

  if (!name || !email || !message) {
    console.error("Validation failed: missing field(s)");
    return res.status(400).json({ success: false, message: "Please fill out all fields." });
  }

  // Show env values are present (don’t print the real password)
  console.log("ENV CHECK:", {
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS_LEN: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
  });

  // Choose SMTP — default to Gmail, but you can switch to another provider via .env
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const secure = port === 465; // true for port 465, false for other ports

  console.log("SMTP Config:", { host, port, secure, user: process.env.EMAIL_USER });

  // Try multiple configurations
  let transporter;
  
  // First try: Gmail service (simplest)
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } catch (err) {
    console.log("Gmail service failed, trying manual SMTP...");
    
    // Fallback: Manual SMTP configuration
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Verify credentials before sending
  try {
    await transporter.verify();
    console.log("SMTP verify: OK");
  } catch (vErr) {
    console.error("SMTP verify FAILED:", {
      message: vErr.message,
      code: vErr.code,
      command: vErr.command
    });
    return res.status(500).json({ 
      success: false, 
      message: `Email configuration error: ${vErr.message}. Please check your Gmail app password.`
    });
  }

  try {
    const info = await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`, // must be your authenticated account
      to: process.env.EMAIL_USER,                               // deliver to you
      replyTo: email,                                           // replies go to visitor
      subject: `New message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`
    });
    console.log("Email sent:", info.messageId);
    return res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("Mailer error:", err);
    return res.status(500).json({ success: false, message: String(err) });
  }
});

// 5) Start server LAST
const port = process.env.PORT || 5500;
console.log("Environment variables loaded:", {
  PORT: process.env.PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS ? `${process.env.EMAIL_PASS.substring(0, 4)}****` : "NOT SET"
});
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
