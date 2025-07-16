// src/app/api/tasks/route.ts
import { NextResponse } from "next/server";
import connectDB from "app/lib/db";
import Task from "app/models/Task";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { title, description, scheduledAt } = await req.json();

    if (!title || !scheduledAt) {
      return NextResponse.json(
        { error: "Title and Scheduled Date/Time are required." },
        { status: 400 }
      );
    }

    const task = await Task.create({ title, description, scheduledAt });
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
