const nodemailer = require("nodemailer")

// Configure nodemailer with your email service
const transporter = nodemailer.createTransport({
  // Replace with your email service configuration
  service: "gmail", // or another service like SendGrid, AWS SES, etc.
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
})

// Function to send OTP email
const sendOtpEmail = async (recipientEmail, otp, ticketDetails) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: recipientEmail,
      subject: "Your OTP for Ticket Transfer",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #1a56db; text-align: center;">Ticket Transfer Verification</h2>
          <p>Hello,</p>
          <p>Someone is trying to transfer a ticket to you. Please use the following One-Time Password (OTP) to complete the transfer process:</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 32px; letter-spacing: 5px; margin: 0; color: #1a56db;">${otp}</h1>
          </div>
          
          <p><strong>Ticket Details:</strong></p>
          <ul style="background-color: #f9fafb; padding: 15px; border-radius: 5px;">
            <li><strong>From:</strong> ${ticketDetails.from}</li>
            <li><strong>To:</strong> ${ticketDetails.to}</li>
            <li><strong>Date:</strong> ${new Date(ticketDetails.departureTime).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${new Date(ticketDetails.departureTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}</li>
            <li><strong>Train:</strong> ${ticketDetails.trainName}</li>
          </ul>
          
          <p>This OTP will expire in 30 minutes for security reasons.</p>
          <p>If you did not request this transfer, please ignore this email.</p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error: error.message }
  }
}

// Function to send transfer link email
const sendTransferLinkEmail = async (recipientEmail, transferLink, ticketDetails, senderName) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: recipientEmail,
      subject: "Your Ticket Transfer Link",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #1a56db; text-align: center;">Ticket Transfer Link</h2>
          <p>Hello,</p>
          <p>${senderName || "Someone"} has transferred a train ticket to you. Click the link below to claim your ticket:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${transferLink}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Claim Your Ticket
            </a>
          </div>
          
          <p><strong>Ticket Details:</strong></p>
          <ul style="background-color: #f9fafb; padding: 15px; border-radius: 5px;">
            <li><strong>From:</strong> ${ticketDetails.from}</li>
            <li><strong>To:</strong> ${ticketDetails.to}</li>
            <li><strong>Date:</strong> ${new Date(ticketDetails.departureTime).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${new Date(ticketDetails.departureTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}</li>
            <li><strong>Train:</strong> ${ticketDetails.trainName}</li>
          </ul>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0;"><strong>Important:</strong> This link will expire in 30 minutes. Please claim your ticket as soon as possible.</p>
          </div>
          
          <p>If you did not expect this ticket transfer, please ignore this email.</p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid #e0e0e0; padding-top: 20px;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending transfer link email:", error)
    return { success: false, error: error.message }
  }
}

module.exports = {
  sendOtpEmail,
  sendTransferLinkEmail,
}
