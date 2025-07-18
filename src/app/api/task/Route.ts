import connectDB from "app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuth } from "firebase-admin/auth";
import * as admin from 'firebase-admin'; 

let firebaseAdminAppInitialized = false;

if (!admin.apps.length) {
  console.log("API Task Route: Attempting Firebase Admin SDK initialization.");
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
  console.log("API Task Route: Firebase Admin SDK already initialized.");
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
  console.log("API Task Route: verifyToken called.");
  if (!firebaseAdminAppInitialized || !admin.apps.length) {
    console.error("Firebase Admin SDK not initialized when verifyToken was called.");
    throw new Error("Firebase Admin SDK not ready. Check server logs for credential errors.");
  }

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    console.warn("Authorization header missing or invalid format.");
    throw new Error("Missing or invalid Authorization header");
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    console.log("API Task Route: Attempting token verification.");
    const decoded = await getAuth().verifyIdToken(token);
    console.log("API Task Route: Token verified.");
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
  console.log("API Task Route: GET handler started.");
  try {
    await connectDB();
    console.log("API Task Route: connectDB successful for GET.");
    const userId = await verifyToken(req);
    console.log("API Task Route: User ID obtained for GET:", userId);

    const tasks = await Task.find({ userId }).sort({ scheduledAt: 1 });
    console.log("API Task Route: Tasks fetched for GET.");
    return NextResponse.json(tasks);
  } catch (error: unknown) {
    console.error("GET error:", error);
    let errorMessage = "Unauthorized";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: errorMessage.includes("token") || errorMessage.includes("Authorization") || errorMessage.includes("SDK not ready") ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) { // This function MUST be present and correctly exported
  console.log("API Task Route: POST handler started.");
  try {
    await connectDB();
    console.log("API Task Route: connectDB successful for POST.");
    const userId = await verifyToken(req);
    console.log("API Task Route: User ID obtained for POST:", userId);

    const { title, description, scheduledAt } = await req.json();
    console.log("API Task Route: Request body parsed for POST.");

    if (!title || !scheduledAt) {
      console.log("API Task Route: Missing fields for POST.");
      return NextResponse.json({ error: "Missing required fields: title and scheduledAt" }, { status: 400 });
    }

    const newTask = await Task.create({
      title,
      description,
      scheduledAt,
      userId,
    });
    console.log("API Task Route: New task created for POST.");

    return NextResponse.json(newTask, { status: 201 });
  } catch (error: unknown) {
    console.error("POST error:", error);
    let errorMessage = "Server error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: errorMessage.includes("token") || errorMessage.includes("Authorization") || errorMessage.includes("SDK not ready") ? 401 : 500 });
  }
}

export async function DELETE(req: NextRequest) {
  console.log("API Task Route: DELETE handler started.");
  try {
    await connectDB();
    console.log("API Task Route: connectDB successful for DELETE.");
    const userId = await verifyToken(req);
    console.log("API Task Route: User ID obtained for DELETE:", userId);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      console.log("API Task Route: Missing ID for DELETE.");
      return NextResponse.json({ error: "Missing task ID" }, { status: 400 });
    }

    const deleted = await Task.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      console.log("API Task Route: Task not found for DELETE.");
      return NextResponse.json({ error: "Task not found or unauthorized to delete" }, { status: 404 });
    }
    console.log("API Task Route: Task deleted for DELETE.");

    return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.error("DELETE error:", error);
    let errorMessage = "Server error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: errorMessage.includes("token") || errorMessage.includes("Authorization") || errorMessage.includes("SDK not ready") ? 401 : 500 });
  }
}

export async function PUT(req: NextRequest) {
  console.log("API Task Route: PUT handler started.");
  try {
    await connectDB();
    console.log("API Task Route: connectDB successful for PUT.");
    const userId = await verifyToken(req);
    console.log("API Task Route: User ID obtained for PUT:", userId);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      console.log("API Task Route: Missing ID for PUT.");
      return NextResponse.json({ error: "Missing task ID" }, { status: 400 });
    }

    const { title, description, scheduledAt } = await req.json();
    if (!title || !scheduledAt) {
      console.log("API Task Route: Missing fields for PUT.");
      return NextResponse.json({ error: "Missing required fields: title and scheduledAt for update" }, { status: 400 });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId },
      { title, description, scheduledAt },
      { new: true }
    );

    if (!updatedTask) {
      console.log("API Task Route: Task not found for PUT.");
      return NextResponse.json({ error: "Task not found or unauthorized to update" }, { status: 404 });
    }
    console.log("API Task Route: Task updated for PUT.");

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error: unknown) {
    console.error("PUT error:", error);
    let errorMessage = "Server error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: errorMessage.includes("token") || errorMessage.includes("Authorization") || errorMessage.includes("SDK not ready") ? 401 : 500 });
  }
}
