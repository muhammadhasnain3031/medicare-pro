import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Room from '@/models/Room';

export async function POST() {
  try {
    await connectDB();
    const existing = await Room.countDocuments();
    if (existing > 0) return NextResponse.json({ message: 'Already seeded' });

    const rooms = [
      // General Ward
      { roomNumber:'G-101', type:'general',      floor:'1', ward:'General', capacity:4, dailyCharge:1500,  status:'available',    facilities:['Fan','Locker','Washroom']          },
      { roomNumber:'G-102', type:'general',      floor:'1', ward:'General', capacity:4, dailyCharge:1500,  status:'available',    facilities:['Fan','Locker','Washroom']          },
      { roomNumber:'G-103', type:'general',      floor:'1', ward:'General', capacity:4, dailyCharge:1500,  status:'maintenance',  facilities:['Fan','Locker']                    },
      // Semi-Private
      { roomNumber:'S-201', type:'semi-private', floor:'2', ward:'Semi-Private', capacity:2, dailyCharge:3000, status:'available', facilities:['AC','TV','Washroom','Locker']    },
      { roomNumber:'S-202', type:'semi-private', floor:'2', ward:'Semi-Private', capacity:2, dailyCharge:3000, status:'available', facilities:['AC','TV','Washroom','Locker']    },
      // Private Rooms
      { roomNumber:'P-301', type:'private',      floor:'3', ward:'Private',      capacity:1, dailyCharge:6000, status:'available', facilities:['AC','TV','Sofa','Washroom','Fridge']},
      { roomNumber:'P-302', type:'private',      floor:'3', ward:'Private',      capacity:1, dailyCharge:6000, status:'available', facilities:['AC','TV','Sofa','Washroom','Fridge']},
      { roomNumber:'P-303', type:'private',      floor:'3', ward:'Private',      capacity:1, dailyCharge:7000, status:'available', facilities:['AC','TV','Sofa','Washroom','Fridge','WiFi']},
      // ICU
      { roomNumber:'ICU-1', type:'icu',          floor:'2', ward:'ICU',          capacity:1, dailyCharge:15000,status:'available', facilities:['Ventilator','Monitor','Oxygen','Emergency Call']},
      { roomNumber:'ICU-2', type:'icu',          floor:'2', ward:'ICU',          capacity:1, dailyCharge:15000,status:'available', facilities:['Ventilator','Monitor','Oxygen','Emergency Call']},
      { roomNumber:'ICU-3', type:'icu',          floor:'2', ward:'ICU',          capacity:1, dailyCharge:15000,status:'available', facilities:['Ventilator','Monitor','Oxygen','Emergency Call']},
      // Emergency
      { roomNumber:'ER-1',  type:'emergency',    floor:'G', ward:'Emergency',    capacity:1, dailyCharge:5000, status:'available', facilities:['Emergency Equipment','Monitor','Oxygen']},
      { roomNumber:'ER-2',  type:'emergency',    floor:'G', ward:'Emergency',    capacity:1, dailyCharge:5000, status:'available', facilities:['Emergency Equipment','Monitor','Oxygen']},
      // Operation Theater
      { roomNumber:'OT-1',  type:'operation',    floor:'3', ward:'Operation',    capacity:1, dailyCharge:20000,status:'available', facilities:['Operation Table','Lights','Anesthesia','Sterile']},
    ];

    await Room.insertMany(rooms);
    return NextResponse.json({ message: `✅ ${rooms.length} rooms created!` });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}