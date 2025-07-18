import connectDB from "app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuth } from "firebase-admin/auth";

// Schema
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

// GET
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const decoded = await getAuth().verifyIdToken(token);

    const tasks = await Task.find({ userId: decoded.uid });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST 
export async function POST(req: Request) {
  try {
    await connectDB();

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

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
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


// DELETE
export async function DELETE(req: Request) {
  try {
    await connectDB();

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const deleted = await Task.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return NextResponse.json({ error: "Task not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized or server error" }, { status: 500 });
  }
}

//  PUT 
export async function PUT(req: Request) {
  try {
    await connectDB();

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

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
  } catch (err) {
    console.error("PUT error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
