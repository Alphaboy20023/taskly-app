import { NextResponse } from 'next/server';
import { User } from 'app/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const user = await User.create({
      email,
      username,
      passwordHash: await bcrypt.hash(password, 12),
      authMethod: 'local'
    });

    return NextResponse.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.username,
        displayName: user.username
      }
    });
  } catch (err: any) {
    if (err.code === 11000) {
      const duplicatedField = Object.keys(err.keyPattern)[0];
      return NextResponse.json(
        { error: `${duplicatedField.charAt(0).toUpperCase() + duplicatedField.slice(1)} already exists` },
        { status: 400 }
      );
    }

    console.error("Registration error:", err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
