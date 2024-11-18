import Users from '../../../models/user';

export const POST = async ({ request }) => {
	const { email, otp } = await request.json();

	try {
		const otpRecord = await Users.findOne({ email });
		if (!otpRecord) {
			return new Response(
				JSON.stringify({ success: false, message: 'OTP has expired. Please request a new one.' }),
				{
					status: 400
				}
			);
		}

		// Check if the OTP is expired based on otpExpiresAt
		const now = new Date();
		if (now > otpRecord.otpExpiresAt) {
			await otpRecord.deleteOne();
			return new Response(
				JSON.stringify({ success: false, message: 'OTP has expired. Please request a new one.' }),
				{
					status: 400
				}
			);
		}

		// Verify the OTP
		if (otpRecord.otp === otp) {
			otpRecord.otp = null;
			otpRecord.otpExpiresAt = null;
			await otpRecord.save();

			return new Response(JSON.stringify({ success: true, message: 'OTP verified successfully!' }));
		} else {
			return new Response(
				JSON.stringify({ success: false, message: 'Incorrect OTP. Please try again.' }),
				{
					status: 400
				}
			);
		}
	} catch (error) {
		console.error('Error verifying OTP:', error);
		return new Response(JSON.stringify({ success: false, message: 'Error verifying OTP' }), {
			status: 500
		});
	}
};
