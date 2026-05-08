import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Medicine from '@/models/Medicine';

export async function POST() {
  try {
    await connectDB();

    const existing = await Medicine.countDocuments();
    if (existing > 0) return NextResponse.json({ message: 'Already seeded' });

    const medicines = [
      { name:'Amoxicillin 500mg',  genericName:'Amoxicillin',   category:'antibiotic',  manufacturer:'GSK',       expiryDate:'2026-12-31', salePrice:250,  purchasePrice:180, stock:500, minStock:50,  unit:'tablets',  batchNumber:'AMX001' },
      { name:'Panadol 500mg',      genericName:'Paracetamol',   category:'painkiller',  manufacturer:'GSK',       expiryDate:'2026-08-15', salePrice:50,   purchasePrice:35,  stock:1000,minStock:100, unit:'tablets',  batchNumber:'PND002' },
      { name:'Omeprazole 20mg',    genericName:'Omeprazole',    category:'antacid',     manufacturer:'Abbott',    expiryDate:'2025-06-30', salePrice:180,  purchasePrice:120, stock:8,   minStock:20,  unit:'capsules', batchNumber:'OMP003' },
      { name:'Metformin 500mg',    genericName:'Metformin',     category:'diabetic',    manufacturer:'Searle',    expiryDate:'2026-11-20', salePrice:120,  purchasePrice:85,  stock:300, minStock:30,  unit:'tablets',  batchNumber:'MET004' },
      { name:'Atorvastatin 20mg',  genericName:'Atorvastatin',  category:'cardiac',     manufacturer:'Pfizer',    expiryDate:'2025-04-10', salePrice:350,  purchasePrice:250, stock:5,   minStock:15,  unit:'tablets',  batchNumber:'ATV005' },
      { name:'Vitamin C 1000mg',   genericName:'Ascorbic Acid', category:'vitamin',     manufacturer:'Nutrifactor',expiryDate:'2027-03-31', salePrice:80,   purchasePrice:55,  stock:200, minStock:25,  unit:'tablets',  batchNumber:'VTC006' },
      { name:'Cetirizine 10mg',    genericName:'Cetirizine',    category:'antihistamine',manufacturer:'Martin',    expiryDate:'2026-09-25', salePrice:60,   purchasePrice:40,  stock:150, minStock:20,  unit:'tablets',  batchNumber:'CTZ007' },
      { name:'Insulin Glargine',   genericName:'Insulin',       category:'diabetic',    manufacturer:'Sanofi',    expiryDate:'2025-05-01', salePrice:2500, purchasePrice:2000,stock:3,   minStock:10,  unit:'injections',batchNumber:'INS008'},
    ];

    await Medicine.insertMany(medicines);
    return NextResponse.json({ message: `✅ ${medicines.length} medicines added!` });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}