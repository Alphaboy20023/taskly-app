import { NextResponse } from 'next/server';
import { adminAuth } from 'app/lib/firebase-admin';
import { connectDB } from 'app/lib/mongoose';
import { User } from 'app/models/User';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    
    const decodedToken = await adminAuth.verifyIdToken(token);
    if (!decodedToken.email) throw new Error('Invalid token');

    await connectDB();

    // Create/update user in MongoDB
    const user = await User.findOneAndUpdate(
      { email: decodedToken.email },
      {
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email.split('@')[0],
        authMethod: 'google',
        lastLogin: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Google authentication failed' },
      { status: 401 }
    );
  }
}