import { NextResponse } from 'next/server';
import { fetchRealStandings } from '@/services/apiFootball';
import { LeagueCode } from '@/types/football';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userApiKey = searchParams.get('apiKey') || process.env.API_FOOTBALL_KEY || process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || '';
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
