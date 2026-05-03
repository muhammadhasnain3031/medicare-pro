export type UserRole = 'admin' | 'doctor' | 'patient';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface Doctor extends User {
  specialization: string;
  qualification: string;
  experience: number;
  fee: number;
  available: boolean;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface Patient extends User {
  dateOfBirth: string;
  bloodGroup: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string[];
}

export interface Appointment {
  _id: string;
  patient: Patient;
  doctor: Doctor;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  type: 'checkup' | 'followup' | 'emergency' | 'consultation';
  symptoms: string;
  notes?: string;
  prescription?: Prescription;
  createdAt: string;
}

export interface Prescription {
  _id: string;
  appointment: string;
  doctor: Doctor;
  patient: Patient;
  diagnosis: string;
  medicines: {
    name: string;
    dosage: string;
    duration: string;
    instructions: string;
  }[];
  notes: string;
  aiGenerated: boolean;
  createdAt: string;
}

export interface MedicalRecord {
  _id: string;
  patient: string;
  doctor: Doctor;
  title: string;
  description: string;
  type: 'lab_report' | 'xray' | 'prescription' | 'diagnosis' | 'other';
  date: string;
  createdAt: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  pendingAppointments: number;
  todayAppointments: number;
  revenue: number;
}

export interface AuthResponse {
  token: string;
  user: User | Doctor | Patient;
}