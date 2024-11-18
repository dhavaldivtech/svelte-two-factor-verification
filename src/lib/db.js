// src/lib/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectDB() {
	if (mongoose.connection.readyState === 0) {
		await mongoose.connect(
			'mongodb+srv://dhavalpparmar09:F4upfwlTRvPcfpdN@cluster0.vudmc.mongodb.net/next-auth?retryWrites=true&w=majority&appName=Cluster0'
		);
		console.log('MongoDB connected');
	}
}
