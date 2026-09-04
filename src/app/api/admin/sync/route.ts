import { NextResponse } from 'next/server';
import { fetchRealFixtures } from '@/services/apiFootball';
import { upsertMatchesToSupabase } from '@/services/supabaseService';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const apiKey = body.apiKey || process.env.API_FOOTBALL_KEY || process.env.NEXT_PUBLIC_API_FOOTBALL_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: 'Vui lòng cung cấp API Key để thực hiện đồng bộ.'
      }, { status: 400 });
    }

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
