import connectDB from "app/lib/db"
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";


const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  scheduledAt: Date,
}, { timestamps: true });

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

// GET all tasks
export async function GET() {
  await connectDB();
  const tasks = await Task.find().sort({ scheduledAt: 1 });
  return NextResponse.json(tasks);
}

// POST task
export async function POST(req: NextRequest) {
  
  await connectDB();
  const { title, description, scheduledAt } = await req.json();

  if (!title || !scheduledAt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const newTask = await Task.create({ title, description, scheduledAt });
  return NextResponse.json(newTask, { status: 201 });
}

// Delete Task
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const deleted = await Task.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted" }, { status: 200 });
  } catch  {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT
export async function PUT(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const { title, description, scheduledAt } = await req.json();
    if (!title || !scheduledAt) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title, description, scheduledAt },
      { new: true }
    );

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (err) {
    console.error("PUT error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

