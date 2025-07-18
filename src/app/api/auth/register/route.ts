//register/route.ts
import { NextResponse } from 'next/server'
import { connectDB } from '../../../lib/mongoose'
import { User } from '../../../models/User'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  console.log("Hit /api/auth/register"); 
  try {
    const {username, email, password } = await req.json()

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'Username, email and password required' }, { status: 400 })
    }

    await connectDB()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: 'User with email already exist' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await User.create({ email, username, password: hashedPassword })

    return NextResponse.json({ user: { id: newUser._id, email: newUser.email, username: newUser.username  } }, { status: 201 })
   
  } catch (error) {
    console.error('[REGISTER_ERROR]', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
