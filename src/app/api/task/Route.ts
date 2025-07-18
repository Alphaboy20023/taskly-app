import connectDB from "app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuth } from "firebase-admin/auth";
import * as admin from 'firebase-admin'; 

let firebaseAdminApp: admin.app.App | null = null;

function initializeFirebaseAdminApp(): admin.app.App {
  if (firebaseAdminApp && admin.apps.length > 0) {
    return firebaseAdminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error("Firebase Admin SDK initialization failed: Missing one or more required environment variables.");
    console.error("Please ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in your .env.local file.");
    throw new Error("Firebase Admin SDK credentials missing. Cannot initialize.");
  }

  try {
    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: privateKey,
      }),
    });
    console.log("Firebase Admin SDK initialized successfully.");
    return firebaseAdminApp;
  } catch (error: unknown) {
    console.error("Firebase Admin SDK initialization error:", error);
    firebaseAdminApp = null;
    throw error;
  }
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
  initializeFirebaseAdminApp();

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    console.warn("Authorization header missing or invalid format.");
    throw new Error("Missing or invalid Authorization header");
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = await getAuth().verifyIdToken(token);
    return decoded.uid;
  } catch (error: unknown) { 
    console.error("Firebase ID token verification failed:", error);
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
    console.error("GET error:", error);
    let errorMessage = "Unauthorized";
    if (error instanceof Error) { 
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: errorMessage.includes("token") || errorMessage.includes("Authorization") ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
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
    console.error("POST error:", error);
    let errorMessage = "Server error";
    if (error instanceof Error) { 
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: errorMessage.includes("token") || errorMessage.includes("Authorization") ? 401 : 500 });
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
    console.error("DELETE error:", error);
    let errorMessage = "Server error";
    if (error instanceof Error) { 
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: errorMessage.includes("token") || errorMessage.includes("Authorization") ? 401 : 500 });
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
    console.error("PUT error:", error);
    let errorMessage = "Server error";
    if (error instanceof Error) { 
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: errorMessage.includes("token") || errorMessage.includes("Authorization") ? 401 : 500 });
  }
}
