import { NextResponse } from 'next/server';
import { getGlobalQuotaStatus } from '@/services/goalApi';

export const dynamic = 'force-dynamic';

export async function GET() {
  const globalStatus = getGlobalQuotaStatus();
  return NextResponse.json({
    success: true,
    current: globalStatus.current,
    limit: globalStatus.limit || 1000
  });
}
