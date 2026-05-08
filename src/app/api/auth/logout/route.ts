import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const token   = req.cookies.get('token')?.value;
    const decoded = verifyToken(token || '');

    if (decoded) {
      await createAuditLog({
        userId:   decoded.id,
        userRole: decoded.role,
        action:   AUDIT_ACTIONS.LOGOUT,
        module:   AUDIT_MODULES.AUTH,
        details:  'User logged out',
        req,
      });
    }

    const res = NextResponse.json({ message: 'Logged out' });
    res.cookies.delete('token');
    return res;
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}