import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const token   = req.cookies.get('token')?.value;
    const decoded = verifyToken(token || '');
    if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findById(decoded.id).select('name role specialization');

    const { messages } = await req.json();

    // ✅ Global Language Instruction
    const langInstruction = `
IMPORTANT: Detect the user's language and respond in the EXACT same language/style. 
If the user speaks in Roman Urdu (e.g., "kya haal hai"), respond in Roman Urdu. 
If the user speaks English, respond in English. Be natural and conversational.`;

    // Role-based system prompt
    const systemPrompts: Record<string, string> = {
      patient: `You are MediCare Pro AI Assistant for patients. 
Help with symptoms (recommend doctor), medical terms, and instructions.
Patient name: ${user?.name}
${langInstruction}
IMPORTANT: Never diagnose. Always recommend professional consultation.`,

      doctor: `You are MediCare Pro AI Assistant for doctors.
Help with clinical decisions, drug info, and ICD-10 codes.
Doctor: ${user?.name} (${user?.specialization || 'General'})
${langInstruction}
Provide evidence-based, professional medical information.`,

      admin: `You are MediCare Pro AI Assistant for hospital administration.
Help with management, scheduling, and operations.
Admin: ${user?.name}
${langInstruction}
Be professional and concise.`,

      default: `You are MediCare Pro AI Assistant.
Help the user with hospital management related queries.
User: ${user?.name} (${user?.role})
${langInstruction}`,
    };

    const systemPrompt = systemPrompts[decoded.role] || systemPrompts.default;

    const completion = await groq.chat.completions.create({
      model:    'llama-3.3-70b-versatile', // ✅ Pro Tip: Is kaam ke liye 70b model Roman Urdu zyada achi samajhta hai
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-10), 
      ],
      max_tokens:  800,
      temperature: 0.7,
      stream:      false,
    });

    const reply = completion.choices[0].message.content;
    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('Chat error:', err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}