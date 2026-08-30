import { NextResponse } from 'next/server';
import { fetchRealFixtures } from '@/services/apiFootball';

const DEFAULT_KEY = '3f779659d2f2fdc3ecf432a3c49b2aae';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userApiKey = searchParams.get('apiKey') || process.env.API_FOOTBALL_KEY || process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || DEFAULT_KEY;
  const leagueCode = searchParams.get('league') as any;

  try {
    const realMatches = await fetchRealFixtures(userApiKey, leagueCode);
    return NextResponse.json({
      success: true,
      isMock: false,
      count: realMatches.length,
      data: realMatches
    });
  } catch (error: any) {
    console.error('API-Football route error:', error);
    return NextResponse.json({
      success: false,
      isMock: true,
      error: error.message || 'Lỗi kết nối API-Football'
    }, { status: 500 });
  }
}
