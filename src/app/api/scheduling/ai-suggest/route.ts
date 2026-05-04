import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Appointment from '@/models/Appointment';
import User from '@/models/User';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { symptoms, preferredDate, preferredTime } = await req.json();

    // Get all available doctors
    const doctors = await User.find({ role: 'doctor', available: true })
      .select('name specialization fee');

    const doctorsList = doctors.map(d =>
      `${d.name} (${d.specialization}, PKR ${d.fee})`
    ).join('\n');

    const prompt = `
You are a smart hospital scheduling assistant.

Patient symptoms: "${symptoms}"
Preferred date: ${preferredDate || 'as soon as possible'}
Preferred time: ${preferredTime || 'any'}

Available doctors:
${doctorsList}

Based on the symptoms, suggest:
1. The most suitable doctor specialization
2. Best doctor from the list
3. Urgency level (routine/soon/urgent/emergency)
4. Brief reason

Respond in this EXACT JSON format only:
{
  "recommendedSpecialization": "General Physician",
  "recommendedDoctor": "Dr. Ahmed Khan",
  "urgency": "soon",
  "reason": "Symptoms suggest possible viral infection, needs examination within 2-3 days",
  "tips": "Drink plenty of fluids and rest until appointment"
}`;

    const completion = await groq.chat.completions.create({
      model:       'llama-3.1-8b-instant',
      messages:    [{ role: 'user', content: prompt }],
      max_tokens:  400,
      temperature: 0.3,
    });

    const raw    = completion.choices[0].message.content?.trim() || '';
    const clean  = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error('AI suggest error:', err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}