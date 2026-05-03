import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Tenant from '@/models/Tenant';

export async function POST() {
  try {
    await connectDB();
    const created: string[] = [];

    // Super Admin
    if (!await User.findOne({ email: 'superadmin@medicare.com' })) {
      await User.create({
        name:     'Super Admin',
        email:    'superadmin@medicare.com',
        role:     'superadmin',
        password: await bcrypt.hash('super123', 10),
      });
      created.push('superadmin');
    }

    // Demo Tenant 1 — City Care Hospital
    let tenant1 = await Tenant.findOne({ slug: 'citycare' });
    if (!tenant1) {
      tenant1 = await Tenant.create({
        name:         'City Care Hospital',
        slug:         'citycare',
        email:        'info@citycare.com',
        phone:        '+92-42-1234567',
        address:      'Lahore, Pakistan',
        primaryColor: '#2563eb',
        plan:         'pro',
        active:       true,
      });
      if (!tenant1?._id) {
  throw new Error('Tenant1 not created properly');
}
      created.push('tenant:citycare');
    }

    // Demo Tenant 2 — Al-Shifa Hospital
    let tenant2 = await Tenant.findOne({ slug: 'alshifa' });
    if (!tenant2) {
      tenant2 = await Tenant.create({
        name:         'Al-Shifa Hospital',
        slug:         'alshifa',
        email:        'info@alshifa.com',
        phone:        '+92-51-9876543',
        address:      'Islamabad, Pakistan',
        primaryColor: '#059669',
        plan:         'basic',
        active:       true,
      });
      if (!tenant2?._id) {
  throw new Error('Tenant2 not created properly');
}
      created.push('tenant:alshifa');
    }

    // Tenant 1 Admin
    if (!await User.findOne({ email: 'admin@citycare.com' })) {
      await User.create({
        name:     'CityC are Admin',
        email:    'admin@citycare.com',
        role:     'admin',
        password: await bcrypt.hash('admin123', 10),
        tenant:   tenant1._id,
      });
      created.push('citycare-admin');
    }

    // Tenant 1 Doctor
    if (!await User.findOne({ email: 'doctor@citycare.com' })) {
      await User.create({
        name:           'Dr. Ahmed',
        email:          'doctor@citycare.com',
        role:           'doctor',
        password:       await bcrypt.hash('doctor123', 10),
        tenant:         tenant1._id,
        specialization: 'Cardiologist',
        fee:            2000,
        available:      true,
      });
      created.push('citycare-doctor');
    }

    // Tenant 2 Admin
    if (!await User.findOne({ email: 'admin@alshifa.com' })) {
      await User.create({
        name:     'Al-Shifa Admin',
        email:    'admin@alshifa.com',
        role:     'admin',
        password: await bcrypt.hash('admin123', 10),
        tenant:   tenant2._id,
      });
      created.push('alshifa-admin');
    }

    return NextResponse.json({
      message: `✅ Created: ${created.join(', ')}`,
      logins: {
        superAdmin:    { email: 'superadmin@medicare.com', password: 'super123' },
        cityCarAdmin:  { email: 'admin@citycare.com',      password: 'admin123', hospital: 'citycare' },
        alShifaAdmin:  { email: 'admin@alshifa.com',       password: 'admin123', hospital: 'alshifa'  },
      }
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}