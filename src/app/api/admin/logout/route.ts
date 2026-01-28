import { NextRequest, NextResponse } from 'next/server';
import { clearAdminCookie } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  await clearAdminCookie();
  return NextResponse.redirect(new URL('/admin-login', request.url));
}
