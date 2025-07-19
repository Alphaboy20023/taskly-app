
// auth/login
import { NextResponse } from "next/server";
import { connectDB } from '../../../lib/mongoose';
import { User } from '../../../models/User';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    // Firebase-only account
    if (user.authMethod === 'firebase') {
      return NextResponse.json({ error: "Use Firebase login" }, { status: 400 });
    }

    if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });
    if (!user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // ✅ Generate local JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.LOCAL_JWT_SECRET!, 
      { expiresIn: "7d" }
    );

    await User.updateOne({ _id: user._id }, { lastLogin: new Date() });

    return NextResponse.json({
      token,
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