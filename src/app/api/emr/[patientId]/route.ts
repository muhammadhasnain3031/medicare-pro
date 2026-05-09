import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import EMR from '@/models/EMR';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

// ✅ Next.js 15+ Context Interface
interface RouteContext {
  params: Promise<{ patientId: string }>;
}

export async function GET(
  req: NextRequest,
  context: RouteContext // Updated
) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();

    // ✅ Must await params
    const { patientId } = await context.params;

    let emr = await EMR.findOne({ patient: patientId })
      .populate('patient', 'name email phone dateOfBirth bloodGroup')
      .populate('visits.doctor', 'name specialization')
      .lean();

    // Create empty EMR if not exists
    if (!emr) {
      const newEMR = await EMR.create({ patient: patientId });
      emr = await EMR.findById(newEMR._id)
        .populate('patient', 'name email phone dateOfBirth bloodGroup')
        .lean();
    }

    return NextResponse.json({ emr });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: RouteContext // Updated
) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    
    // ✅ Must await params
    const { patientId } = await context.params;
    const body = await req.json();

    // Add visit
    if (body.addVisit) {
      const emr = await EMR.findOneAndUpdate(
        { patient: patientId },
        {
          $push: { visits: { ...body.addVisit, date: new Date().toISOString().split('T')[0] } },
          $set:  { lastUpdated: new Date().toISOString() },
        },
        { new: true, upsert: true }
      ).populate('visits.doctor', 'name specialization').lean();
      return NextResponse.json({ emr });
    }

    // Calculate BMI
    if (body.height && body.weight) {
      const hM   = body.height / 100;
      body.bmi   = Math.round((body.weight / (hM * hM)) * 10) / 10;
    }

    // Generate AI Summary
    if (body.generateAI) {
      const emrData = await EMR.findOne({ patient: patientId }).lean() as any;
      if (emrData) {
        const prompt = `
You are a medical AI assistant. Generate a concise professional health summary for this patient:

Blood Group: ${emrData.bloodGroup || 'Unknown'}
Allergies: ${emrData.allergies?.join(', ') || 'None'}
Chronic Conditions: ${emrData.chronicConditions?.join(', ') || 'None'}
Current Medications: ${emrData.currentMedications?.join(', ') || 'None'}
Height: ${emrData.height}cm, Weight: ${emrData.weight}kg, BMI: ${emrData.bmi || 'N/A'}
Recent Diagnoses: ${emrData.visits?.slice(-3).map((v: any) => v.diagnosis).join(', ') || 'None'}
Surgical History: ${emrData.surgicalHistory?.map((s: any) => s.procedure).join(', ') || 'None'}

Write a 3-4 sentence professional health summary highlighting key concerns and recommendations.`;

        const completion = await groq.chat.completions.create({
          model:       'llama-3.1-8b-instant',
          messages:    [{ role: 'user', content: prompt }],
          max_tokens:  300,
          temperature: 0.3,
        });
        body.aiSummary = completion.choices[0].message.content || '';
      }
      delete body.generateAI;
    }

    body.lastUpdated = new Date().toISOString();

    const emr = await EMR.findOneAndUpdate(
      { patient: patientId },
      { $set: body },
      { new: true, upsert: true }
    )
    .populate('patient', 'name email phone dateOfBirth bloodGroup')
    .populate('visits.doctor', 'name specialization')
    .lean();

    return NextResponse.json({ emr });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}