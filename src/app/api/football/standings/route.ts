import { NextResponse } from 'next/server';
import { fetchRealStandings } from '@/services/apiFootball';
import { LeagueCode } from '@/types/football';

const DEFAULT_KEY = '3f779659d2f2fdc3ecf432a3c49b2aae';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userApiKey = searchParams.get('apiKey') || process.env.API_FOOTBALL_KEY || process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || DEFAULT_KEY;
  const leagueCode = (searchParams.get('league') || 'PL') as LeagueCode;

  try {
    const realStandings = await fetchRealStandings(userApiKey, leagueCode);
    return NextResponse.json({
      success: true,
      count: realStandings.length,
      data: realStandings
    });
  } catch (error: any) {
    console.error('API-Football standings route error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi kết nối API-Football standings'
    }, { status: 500 });
  }
}
