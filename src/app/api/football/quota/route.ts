import { NextResponse } from 'next/server';
import { fetchApiQuotaStatus, getGlobalQuotaStatus } from '@/services/apiFootball';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userApiKey = searchParams.get('apiKey') || process.env.API_FOOTBALL_KEY || process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || '';

  try {
    const quotaInfo = await fetchApiQuotaStatus(userApiKey);
    if (quotaInfo && typeof quotaInfo.current === 'number') {
      return NextResponse.json({
        success: true,
        current: quotaInfo.current,
        limit: quotaInfo.limit
      });
    }
  } catch (error: any) {
    console.error('Quota API route error:', error);
  }

  const globalStatus = getGlobalQuotaStatus();
  return NextResponse.json({
    success: true,
    current: globalStatus.current,
    limit: globalStatus.limit
  });
}
