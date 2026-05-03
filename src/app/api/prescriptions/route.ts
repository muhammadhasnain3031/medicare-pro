import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Prescription from '@/models/Prescription';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const query: any = user.role === 'patient'
      ? { patient: user.id }
      : { doctor: user.id };

    const prescriptions = await Prescription.find(query)
      .populate('doctor',  'name specialization')
      .populate('patient', 'name dateOfBirth bloodGroup')
      .sort({ createdAt: -1 });

    return NextResponse.json({ prescriptions });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user || user.role !== 'doctor')
      return NextResponse.json({ message: 'Doctors only' }, { status: 403 });

    await connectDB();
    const body = await req.json();

    let medicines = body.medicines || [];
    let aiGenerated = false;

    // AI prescription generate karo agar symptoms diye hain
    if (body.generateWithAI && body.symptoms) {
      const prompt = `
You are an AI medical assistant helping a doctor write a prescription.
Patient symptoms: ${body.symptoms}
Diagnosis: ${body.diagnosis}

Generate a prescription with appropriate medicines.
Respond ONLY in this exact JSON format:
{
  "medicines": [
    {
      "name": "Medicine Name",
      "dosage": "500mg",
      "duration": "7 days",
      "instructions": "Take after meals"
    }
  ],
  "notes": "Additional medical notes"
}
`;
      const completion = await groq.chat.completions.create({
        model:       'llama-3.1-8b-instant',
        messages:    [{ role: 'user', content: prompt }],
        max_tokens:  600,
        temperature: 0.3,
      });

      const raw    = completion.choices[0].message.content?.trim() || '';
      const clean  = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      medicines    = parsed.medicines || [];
      aiGenerated  = true;
      if (!body.notes && parsed.notes) body.notes = parsed.notes;
    }

    const prescription = await Prescription.create({
      appointment: body.appointmentId,
      doctor:      user.id,
      patient:     body.patientId,
      diagnosis:   body.diagnosis,
      medicines,
      notes:       body.notes || '',
      aiGenerated,
    });

    return NextResponse.json({ prescription }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}