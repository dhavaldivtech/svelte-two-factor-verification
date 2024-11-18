import User from '../../../models/user';
import { connectDB } from '$lib/db';
import { sendOTPEmail } from '$lib/mailer';
import { generateOTP } from '../../../utils/generateOTP';

export const POST = async ({ request }) => {
	const { email } = await request.json();

	if (!email) {
		return new Response(JSON.stringify({ success: false, message: 'Email is required' }), {
			status: 400
		});
	}

	await connectDB();

	const user = await User.findOne({ email });

	// If OTP exists and has not expired, don't generate a new one
	if (user && user.otp && user.otpExpiresAt > new Date()) {
		return new Response(
			JSON.stringify({ success: false, message: 'An OTP has already been sent.' }),
			{ status: 400 }
		);
	}

	const otp = generateOTP();
	const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

	const updatedUser = await User.findOneAndUpdate(
		{ email },
		{ otp, otpExpiresAt },
		{ upsert: true, new: true }
	);

	if (!updatedUser) {
		return new Response(JSON.stringify({ success: false, message: 'Failed to update OTP.' }), {
			status: 500
		});
	}

	await sendOTPEmail(email, otp);

	return new Response(JSON.stringify({ success: true, message: 'OTP resent successfully.' }), {
		status: 200
	});
};
