import { NextResponse } from 'next/server';
import { getMatchesFromSupabase } from '@/services/supabaseService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leagueCode = searchParams.get('league') as any;

  try {
    // Read 100% directly from Supabase Database (0 API-Football requests consumed)
    // Read 100% directly from Supabase Database (0 Goal API requests consumed)
    const dbMatches = await getMatchesFromSupabase(leagueCode);

    return NextResponse.json({
      success: true,
      source: 'supabase-db',
      count: dbMatches.length,
      data: dbMatches
    });
  } catch (error: any) {
    console.error('Supabase DB fetch error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi kết nối Supabase Database'
    }, { status: 500 });
  }
}
