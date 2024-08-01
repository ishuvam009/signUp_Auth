require('dotenv').config();
const nodemailer = require('nodemailer');

// Configure the transporter with Ethereal Email credentials
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: process.env.ETHEREAL_PORT,
    auth: {
        user: process.env.ETHEREAL_EMAIL, // replace with your Ethereal email
        pass: process.env.ETHEREAL_PASSWORD             // replace with your Ethereal email password
    }
});

const sendAuthorizationEmail = async (user) => {
    const mailOptions = {
        from: process.env.ETHEREAL_EMAIL, // replace with your Ethereal email
        to: `${user.email}`,                 // replace with owner's email
        subject: 'New User Registration Authorization',
        text: `A new user has registered with the following details:\n\n
               Name: ${user.name}\n
               Email: ${user.email}\n
               Phone: ${user.phone}\n\n
               Please authorize this registration by clicking the following link:\n
               ${process.env.SERVER_URL}/authorize?email=${user.email}`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Authorization email sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send authorization email');
    }
};

module.exports = sendAuthorizationEmail;
