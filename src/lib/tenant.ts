import { connectDB } from './db';
import Tenant from '@/models/Tenant';

// Slug se tenant dhundo
export async function getTenantBySlug(slug: string) {
  await connectDB();
  return Tenant.findOne({ slug, active: true });
}

// Token se tenant ID nikalo
export function getTenantFromToken(decoded: any) {
  return decoded?.tenantId || null;
}