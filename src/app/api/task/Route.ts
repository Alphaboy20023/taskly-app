import connectDB from "app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuth } from "firebase-admin/auth";

// Define Task schema and model
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  scheduledAt: Date,
  userId: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

//  verify Firebase token
async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }
  const token = authHeader.replace("Bearer ", "");
  const decoded = await getAuth().verifyIdToken(token);
  return decoded.uid;
}

// GET 
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userId = await verifyToken(req);

    const tasks = await Task.find({ userId }).sort({ scheduledAt: 1 });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST 
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const userId = await verifyToken(req);

    const { title, description, scheduledAt } = await req.json();

    if (!title || !scheduledAt) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const newTask = await Task.create({
      title,
      description,
      scheduledAt,
      userId,
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const userId = await verifyToken(req);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const deleted = await Task.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return NextResponse.json({ error: "Task not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Unauthorized or server error" }, { status: 500 });
  }
}

// PUT 
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const userId = await verifyToken(req);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const { title, description, scheduledAt } = await req.json();
    if (!title || !scheduledAt) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId },
      { title, description, scheduledAt },
      { new: true }
    );

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
