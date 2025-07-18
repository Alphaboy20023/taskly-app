//login/route.ts
import { NextResponse } from "next/server";
import { connectDB } from '../../../lib/mongoose'
import { User } from '../../../models/User'
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });

    await connectDB();

    const user = await User.findOne({ email });
    if (!user)
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      }
       },
    // console.log("Request body:", { email, username, password });

    { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Login error", error }, { status: 500 });
  }
}
