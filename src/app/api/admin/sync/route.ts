import { NextResponse } from 'next/server';
import { fetchRealFixtures } from '@/services/apiFootball';
import { upsertMatchesToSupabase } from '@/services/supabaseService';

const DEFAULT_KEY = '3f779659d2f2fdc3ecf432a3c49b2aae';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const apiKey = body.apiKey || process.env.API_FOOTBALL_KEY || process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || DEFAULT_KEY;

    console.log('🚀 Triggering manual sync from API-Football to Supabase DB...');
    
    // 1. Fetch fresh matches from API-Football
    const realMatches = await fetchRealFixtures(apiKey);

    if (!realMatches || realMatches.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Không tìm thấy trận đấu mới từ API-Football.'
      });
    }

    // 2. Clean and upsert matches into Supabase Database
    const savedCount = await upsertMatchesToSupabase(realMatches);

    return NextResponse.json({
      success: true,
      message: `Đã nạp sạch ${savedCount} trận đấu mới vào Supabase Database thành công!`,
      count: savedCount
    });
  } catch (error: any) {
    console.error('Manual sync API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi đồng bộ dữ liệu vào Supabase'
    }, { status: 500 });
  }
}
