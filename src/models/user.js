// src/models/user.js
import mongoose from 'mongoose';

// Define the schema
const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	otp: {
		type: String,
		default: null
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	otpExpiresAt: {
		type: Date,
		default: null
	}
});

// Export the model
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
