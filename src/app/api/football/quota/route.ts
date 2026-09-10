import { NextResponse } from 'next/server';
import { fetchApiQuotaStatus, getGlobalQuotaStatus, getGoalApiKey } from '@/services/goalApi';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userApiKey = searchParams.get('apiKey') || getGoalApiKey();

  try {
    const quotaInfo = await fetchApiQuotaStatus(userApiKey);
    if (quotaInfo && typeof quotaInfo.current === 'number') {
      return NextResponse.json({
        success: true,
        current: quotaInfo.current,
        limit: quotaInfo.limit || 1000
      });
    }
  } catch (error: any) {
    console.error('Goal API Quota route error:', error);
  }

  const globalStatus = getGlobalQuotaStatus();
  return NextResponse.json({
    success: true,
    current: globalStatus.current,
    limit: globalStatus.limit || 1000
  });
}
