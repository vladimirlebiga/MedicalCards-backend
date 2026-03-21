const nodemailer = require('nodemailer'); // CommonJS
// or, if you use ES modules:
// import nodemailer from 'nodemailer';

const { constants } = require('../constants/constants');
const { config } = require('../constants/constants');

const transporter = nodemailer.createTransport(config);

async function sendEmail(to, subject, text, html) {
    try {
        const mailOptions = {
            from: constants.GMAIL_USER,
            to,
            subject,
        };
        
        // Add text if provided (for plain text email clients)
        if (text) {
            mailOptions.text = text;
        }
        
        // Add html if provided (for HTML email clients)
        if (html) {
            mailOptions.html = html;
        }
        
        const info = await transporter.sendMail(mailOptions);
    
        return info;
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
module.exports = { sendEmail };