import connectDB from "app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuth } from "firebase-admin/auth";
import * as admin from 'firebase-admin'; 

// Initialize Firebase Admin SDK once globally, but safely
let firebaseAdminAppInitialized = false;

if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      console.error("Firebase Admin SDK initialization failed: Missing one or more required environment variables.");
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey,
        }),
      });
      console.log("Firebase Admin SDK initialized successfully (global).");
      firebaseAdminAppInitialized = true;
    }
  } catch (error: unknown) { 
    console.error("Firebase Admin SDK global initialization error:", error);
  }
} else {
  firebaseAdminAppInitialized = true;
}


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

async function verifyToken(req: NextRequest) {
  if (!firebaseAdminAppInitialized || !admin.apps.length) {
    throw new Error("Firebase Admin SDK not ready. Check server logs for credential errors.");
  }

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = await getAuth().verifyIdToken(token);
    return decoded.uid;
  } catch (error: unknown) { 
    if (error instanceof Error) { 
      throw new Error(`Invalid or expired token: ${error.message}`);
    }
    throw new Error("Invalid or expired token");
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB(); 
    const userId = await verifyToken(req); 

    const tasks = await Task.find({ userId }).sort({ scheduledAt: 1 });
    return NextResponse.json(tasks);
  } catch (error: unknown) { 
    let errorMessage = "Unauthorized";
    if (error instanceof Error) { 
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: errorMessage.includes("token") || errorMessage.includes("Authorization") || errorMessage.includes("SDK not ready") ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) { // This is the key function for POST requests
  try {
    await connectDB(); 
    const userId = await verifyToken(req); 

    const { title, description, scheduledAt } = await req.json();

    if (!title || !scheduledAt) {
      return NextResponse.json({ error: "Missing required fields: title and scheduledAt" }, { status: 400 });
    }

    const newTask = await Task.create({
      title,
      description,
      scheduledAt,
      userId,
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error: unknown) { 
    let errorMessage = "Server error";
    if (error instanceof Error) { 
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: errorMessage.includes("token") || errorMessage.includes("Authorization") || errorMessage.includes("SDK not ready") ? 401 : 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB(); 
    const userId = await verifyToken(req); 

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id"); 
    if (!id) return NextResponse.json({ error: "Missing task ID" }, { status: 400 });

    const deleted = await Task.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return NextResponse.json({ error: "Task not found or unauthorized to delete" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 });
  } catch (error: unknown) { 
    let errorMessage = "Server error";
    if (error instanceof Error) { 
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: errorMessage.includes("token") || errorMessage.includes("Authorization") || errorMessage.includes("SDK not ready") ? 401 : 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB(); 
    const userId = await verifyToken(req);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id"); 
    if (!id) return NextResponse.json({ error: "Missing task ID" }, { status: 400 });

    const { title, description, scheduledAt } = await req.json();
    if (!title || !scheduledAt) {
      return NextResponse.json({ error: "Missing required fields: title and scheduledAt for update" }, { status: 400 });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId },
      { title, description, scheduledAt },
      { new: true } 
    );

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found or unauthorized to update" }, { status: 404 });
    }

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error: unknown) { 
    let errorMessage = "Server error";
    if (error instanceof Error) { 
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: errorMessage.includes("token") || errorMessage.includes("Authorization") || errorMessage.includes("SDK not ready") ? 401 : 500 });
  }
}
