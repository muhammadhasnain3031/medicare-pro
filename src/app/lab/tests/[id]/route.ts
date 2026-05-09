import { NextResponse, NextRequest } from "next/server"; // NextRequest use karna behtar hai
import { connectDB } from "@/lib/db";
import LabTest from "@/models/LabTest";

// ✅ Next.js 15+ Context Interface
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  req: NextRequest,
  context: RouteContext // ✅ Changed from { params }
) {
  try {
    await connectDB();

    // ✅ CRITICAL FIX: await the params promise
    const { id } = await context.params;
    
    const { status } = await req.json();

    const updated = await LabTest.findByIdAndUpdate(
      id, // Used awaited id
      { status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Test not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Update failed" },
      { status: 500 }
    );
  }
}