
// auth/login
import { NextResponse } from "next/server";
import { connectDB } from '../../../lib/mongoose';
import { User } from '../../../models/User';
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    // Handle auth method mismatch
    if (user.authMethod === 'firebase') {
      return NextResponse.json({ error: "Use Firebase login" }, { status: 400 });
    }

    // Local auth validation
    if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });
    if (!user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Successful login
    await User.updateOne({ _id: user._id }, { lastLogin: new Date() });

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.username,
        displayName: user.username,
        authMethod: user.authMethod
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}