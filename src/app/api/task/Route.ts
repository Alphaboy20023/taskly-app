import { NextRequest, NextResponse } from "next/server";
import connectDB from "app/lib/db";
import mongoose from "mongoose";
import * as admin from "firebase-admin";
import jwt from "jsonwebtoken";
import { getAuth } from "firebase-admin/auth";
import { adminAuth } from "app/lib/firebase-admin";
import { User } from "app/models/User";

// --- Firebase Admin Initialization ---
if (!admin.apps.length) {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
      console.log("✅ Firebase Admin initialized.");
    } catch (err) {
      console.error("❌ Firebase Admin init error:", err);
    }
  } else {
    console.warn("⚠️ Missing Firebase Admin env variables");
  }
}

// --- Task Schema ---
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  scheduledAt: { type: Date, required: true },
  userId: { type: String, required: true },
}, { timestamps: true });

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

// --- Auth Token Verifier ---
const verifyToken = async (req: NextRequest): Promise<string> => {
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) throw new Error("Missing or invalid Authorization header");

  const token = authHeader.replace("Bearer ", "");

  // Firebase auth
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    console.log("⚠️ Firebase token failed. Falling back to local JWT.");
  }

  // Local JWT fallback
  try {
    const decoded = jwt.verify(token, process.env.LOCAL_JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch {
    throw new Error("Invalid or expired token");
  }
};

// --- GET All Tasks ---
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userId = await verifyToken(req);

    const tasks = await Task.find({ userId }).sort({ scheduledAt: 1 });
    return NextResponse.json(tasks);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: /token|auth/i.test(msg) ? 401 : 500 });
  }
}

// --- POST New Task ---
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const userId = await verifyToken(req);
    const { title, description, scheduledAt } = await req.json();

    if (!title || !scheduledAt) {
      return NextResponse.json({ error: "Title and scheduledAt are required" }, { status: 400 });
    }

    const newTask = await Task.create({
      title,
      description,
      scheduledAt: new Date(scheduledAt),
      userId,
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: /token|auth/i.test(msg) ? 401 : 500 });
  }
}

// --- DELETE Task ---
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const user = await verifyToken(req); 
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("id");

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const deleted = await Task.findByIdAndDelete(taskId);

    if (!deleted) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, {
      status: /token|auth/i.test(msg) ? 401 : 500
    });
  }
}

// --- PUT Update Task ---
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const user = await verifyToken(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const { title, description, scheduledAt } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }
    if (!title || !scheduledAt) {
      return NextResponse.json({ error: "Title and scheduledAt are required" }, { status: 400 });
    }

    const updated = await Task.findByIdAndUpdate(
      id,
      { title, description, scheduledAt },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, {
      status: /token|auth/i.test(msg) ? 401 : 500
    });
  }
}