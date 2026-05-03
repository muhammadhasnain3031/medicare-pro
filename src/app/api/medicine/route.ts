import { NextResponse } from 'next/server';
import Medicine from '@/models/Medicine';

// GET all medicines
export async function GET() {
  const meds = await Medicine.find();
  return NextResponse.json({ meds });
}

// ADD medicine
export async function POST(req: Request) {
  const body = await req.json();

  const med = await Medicine.create({
    name: body.name,
    price: body.price,
    company: body.company
  });

  return NextResponse.json({ med });
}