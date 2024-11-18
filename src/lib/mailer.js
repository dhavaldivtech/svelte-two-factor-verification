// src/lib/mailer.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter
const transporter = nodemailer.createTransport({
	service: 'gmail', // or any other email service
	auth: {
		user: process.env.EMAIL_USER, // Your email address
		pass: process.env.EMAIL_PASS // Your email password or app password
	}
});

// Send email function
export async function sendOTPEmail(to, otp) {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to,
		subject: 'Your OTP for Registration',
		text: `Your OTP is: ${otp}`,
		html: `<p>Your OTP is: <b>${otp}</b></p>` // Optional HTML formatting
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log('Email sent successfully');
	} catch (error) {
		console.error('Error sending email:', error);
		throw new Error('Email sending failed');
	}
}
