import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import LabTest from "@/models/LabTest";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { status } = await req.json();

    const updated = await LabTest.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Update failed" },
      { status: 500 }
    );
  }
}