import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Common fields
  email: { type: String, required: true, unique: true },
  authMethod: { type: String, enum: ['local', 'firebase'], required: true },
  
  // Local auth only
  username: { type: String, unique: true, sparse: true },
  passwordHash: { type: String, select: false },
  
  // Firebase auth only
  firebaseUID: { type: String, unique: true, sparse: true }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
