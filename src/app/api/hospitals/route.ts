import { NextResponse } from "next/server";
import Hospital from "@/models/Hospital";
// import connectDB from "@/lib/mongodb"; // Apna DB connection yahan import karein

export async function POST(req: Request) {
  try {
    // await connectDB(); 
    const { name, slug, adminEmail } = await req.json();

    const newHospital = await Hospital.create({ name, slug, adminEmail });

    return NextResponse.json({ message: "Hospital Created!", hospital: newHospital }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating hospital", error }, { status: 500 });
  }
}