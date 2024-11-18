import User from '../../models/user';
import { connectDB } from '$lib/db';
import { sendOTPEmail } from '$lib/mailer';
import { redirect } from '@sveltejs/kit';
import { generateOTP } from '../../utils/generateOTP';

export async function load() {
	await connectDB();
}
export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const email = formData.get('email');

		if (!email) {
			return { success: false, message: 'Email is required' };
		}

		await connectDB();

		const otp = generateOTP();
		const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // Expire in 5 minutes

		await User.findOneAndUpdate({ email }, { otp, otpExpiresAt }, { upsert: true, new: true });

		await sendOTPEmail(email, otp);

		// Redirect to OTP page with email in the query string
		throw redirect(303, `/otp?email=${encodeURIComponent(email)}`);
	}
};
