import Users from '../../models/user';
import { connectDB } from '$lib/db';
import { redirect } from '@sveltejs/kit';

export async function load({ url }) {
	const email = url.searchParams.get('email');
	return { email };
}

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const otp = formData.get('otp');
		console.log(email, 'email');
		console.log(otp, 'otp');

		if (!email || !otp) {
			return { success: false, message: 'Email and OTP are required', email: email };
		}

		await connectDB();

		const otpRecord = await Users.findOne({ email });

		if (!otpRecord) {
			return {
				success: false,
				message: 'OTP has expired. Please request a new one.',
				email
			};
		}

		// Check if the OTP is expired based on otpExpiresAt
		const now = new Date();
		if (now > otpRecord.otpExpiresAt) {
			await otpRecord.deleteOne(); // remove expired OTP from database
			return {
				success: false,
				message: 'OTP has expired. Please request a new one.',
				email
			};
		}

		// Verify the OTP
		if (otpRecord.otp === otp) {
			otpRecord.otp = null;
			otpRecord.otpExpiresAt = null;
			await otpRecord.save();

			throw redirect(303, '/');
		} else {
			return {
				success: false,
				message: 'Incorrect OTP. Please try again.',
				email
			};
		}
	}
};
