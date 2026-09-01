import { NextResponse } from 'next/server';
import { getMatchesFromSupabase } from '@/services/supabaseService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leagueCode = searchParams.get('league') as any;

  try {
    // 100% Pure Database Fetching: Always query matches directly from Supabase DB
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
