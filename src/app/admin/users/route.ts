import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  const users = await User.find(role ? { role } : {});
  return NextResponse.json({ users });
}

export async function DELETE(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  await User.findByIdAndDelete(id);

  return NextResponse.json({
    success: true,
    message: "User deleted"
  });
}