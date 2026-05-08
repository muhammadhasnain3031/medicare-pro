import { connectDB } from './db';
import AuditLog from '@/models/AuditLog';
import { NextRequest } from 'next/server';

export interface AuditParams {
  userId?:   string;
  userName?: string;
  userRole?: string;
  action:    string;
  module:    string;
  details?:  string;
  status?:   'success' | 'failed' | 'warning';
  metadata?: Record<string, any>;
  req?:      NextRequest;
}

export async function createAuditLog(params: AuditParams) {
  try {
    await connectDB();

    const ipAddress = params.req
      ? (params.req.headers.get('x-forwarded-for') ||
         params.req.headers.get('x-real-ip') ||
         '127.0.0.1').split(',')[0].trim()
      : '';

    const userAgent = params.req
      ? (params.req.headers.get('user-agent') || '')
      : '';

    await AuditLog.create({
      user:      params.userId  || null,
      userName:  params.userName || 'System',
      userRole:  params.userRole || '',
      action:    params.action,
      module:    params.module,
      details:   params.details || '',
      ipAddress,
      userAgent,
      status:    params.status || 'success',
      metadata:  params.metadata || {},
    });
  } catch (err) {
    // Silent fail — don't break main flow
    console.error('Audit log error:', err);
  }
}

// Common action constants
export const AUDIT_ACTIONS = {
  // Auth
  LOGIN:           'LOGIN',
  LOGOUT:          'LOGOUT',
  LOGIN_FAILED:    'LOGIN_FAILED',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  // Users
  USER_CREATED:    'USER_CREATED',
  USER_UPDATED:    'USER_UPDATED',
  USER_DELETED:    'USER_DELETED',
  // Appointments
  APPOINTMENT_CREATED:   'APPOINTMENT_CREATED',
  APPOINTMENT_UPDATED:   'APPOINTMENT_UPDATED',
  APPOINTMENT_CANCELLED: 'APPOINTMENT_CANCELLED',
  // Prescriptions
  PRESCRIPTION_CREATED:  'PRESCRIPTION_CREATED',
  // Lab
  LAB_TEST_CREATED:  'LAB_TEST_CREATED',
  LAB_TEST_UPDATED:  'LAB_TEST_UPDATED',
  LAB_RESULT_ADDED:  'LAB_RESULT_ADDED',
  LAB_PAYMENT_MADE:  'LAB_PAYMENT_MADE',
  // Billing
  INVOICE_CREATED:  'INVOICE_CREATED',
  INVOICE_PAID:     'INVOICE_PAID',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  // Pharmacy
  MEDICINE_ADDED:   'MEDICINE_ADDED',
  MEDICINE_UPDATED: 'MEDICINE_UPDATED',
  BILL_CREATED:     'BILL_CREATED',
  // Tenant
  TENANT_CREATED:   'TENANT_CREATED',
  TENANT_UPDATED:   'TENANT_UPDATED',
  TENANT_DISABLED:  'TENANT_DISABLED',
} as const;

export const AUDIT_MODULES = {
  AUTH:         'Authentication',
  USERS:        'User Management',
  APPOINTMENTS: 'Appointments',
  PRESCRIPTIONS:'Prescriptions',
  LAB:          'Laboratory',
  BILLING:      'Billing',
  PHARMACY:     'Pharmacy',
  TENANT:       'Tenant Management',
  SYSTEM:       'System',
} as const;