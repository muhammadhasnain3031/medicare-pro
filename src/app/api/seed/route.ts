import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST() {
  try {
    await connectDB();

    const created = [];

    // Admin
    if (!await User.findOne({ email: 'admin@medicare.com' })) {
      await User.create({
        name:     'Admin User',
        email:    'admin@medicare.com',
        role:     'admin',
        password: await bcrypt.hash('admin123', 10),
        phone:    '+92-300-0000000',
      });
      created.push('admin');
    }

    // Doctor 1
    if (!await User.findOne({ email: 'doctor@medicare.com' })) {
      await User.create({
        name:           'Dr. Sarah Ahmed',
        email:          'doctor@medicare.com',
        role:           'doctor',
        password:       await bcrypt.hash('doctor123', 10),
        phone:          '+92-300-1111111',
        specialization: 'Cardiologist',
        qualification:  'MBBS, MD',
        experience:     10,
        fee:            2000,
        available:      true,
      });
      created.push('doctor');
    }

    // Doctor 2
    if (!await User.findOne({ email: 'doctor2@medicare.com' })) {
      await User.create({
        name:           'Dr. Ali Hassan',
        email:          'doctor2@medicare.com',
        role:           'doctor',
        password:       await bcrypt.hash('doctor123', 10),
        phone:          '+92-300-3333333',
        specialization: 'General Physician',
        qualification:  'MBBS',
        experience:     5,
        fee:            1000,
        available:      true,
      });
      created.push('doctor2');
    }

    // Patient
    if (!await User.findOne({ email: 'patient@medicare.com' })) {
      await User.create({
        name:        'Muhammad Hasnain',
        email:       'patient@medicare.com',
        role:        'patient',
        password:    await bcrypt.hash('patient123', 10),
        phone:       '+92-300-2222222',
        bloodGroup:  'B+',
        dateOfBirth: '1995-05-15',
        address:     'Sargodha, Punjab',
      });
      created.push('patient');
    }
      // Receptionist
if (!await User.findOne({ email: 'reception@medicare.com' })) {
  await User.create({
    name: 'Sara Reception', email: 'reception@medicare.com',
    role: 'receptionist', password: await bcrypt.hash('recep123', 10),
    phone: '+92-300-4444444',
  });
  created.push('receptionist');
}

// Nurse
if (!await User.findOne({ email: 'nurse@medicare.com' })) {
  await User.create({
    name: 'Nurse Ayesha', email: 'nurse@medicare.com',
    role: 'nurse', password: await bcrypt.hash('nurse123', 10),
    phone: '+92-300-5555555',
  });
  created.push('nurse');
}

// Lab Staff
if (!await User.findOne({ email: 'lab@medicare.com' })) {
  await User.create({
    name: 'Lab Technician Bilal', email: 'lab@medicare.com',
    role: 'lab', password: await bcrypt.hash('lab123', 10),
    phone: '+92-300-6666666',
  });
  created.push('lab');
}
    return NextResponse.json({
      message: `✅ Created: ${created.join(', ') || 'All already exist'}`,
      credentials: {
        admin:   { email: 'admin@medicare.com',   password: 'admin123'   },
        doctor:  { email: 'doctor@medicare.com',  password: 'doctor123'  },
        patient: { email: 'patient@medicare.com', password: 'patient123' },
      }
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}