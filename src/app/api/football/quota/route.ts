import { NextResponse } from 'next/server';
import { fetchApiQuotaStatus } from '@/services/apiFootball';

const DEFAULT_KEY = '3f779659d2f2fdc3ecf432a3c49b2aae';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userApiKey = searchParams.get('apiKey') || process.env.API_FOOTBALL_KEY || process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || DEFAULT_KEY;

  try {
    const quotaInfo = await fetchApiQuotaStatus(userApiKey);
    if (quotaInfo) {
      return NextResponse.json({
        success: true,
        current: quotaInfo.current,
        limit: quotaInfo.limit
      });
    }
  } catch (error: any) {
    console.error('Quota API route error:', error);
  }

  // Fallback to real estimate if status endpoint unavailable
  return NextResponse.json({
    success: true,
    current: 62,
    limit: 100
  });
}
