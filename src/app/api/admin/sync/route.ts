import { NextResponse } from 'next/server';
import { fetchRealFixtures } from '@/services/apiFootball';
import { upsertMatchesToSupabase } from '@/services/supabaseService';

export const dynamic = 'force-dynamic';

async function performSync(apiKey?: string) {
  const keyToUse = apiKey || process.env.API_FOOTBALL_KEY || process.env.NEXT_PUBLIC_API_FOOTBALL_KEY;
  if (!keyToUse) {
    return { success: false, message: 'Vui lòng cung cấp API Key để thực hiện đồng bộ.' };
  }

  console.log('🚀 Executing database status sync from API-Football to Supabase DB...');
  const realMatches = await fetchRealFixtures(keyToUse);

  if (!realMatches || realMatches.length === 0) {
    return { success: false, message: 'Không tìm thấy kết quả mới từ API-Football.' };
  }

  const savedCount = await upsertMatchesToSupabase(realMatches);
  return {
    success: true,
    message: `Đã cập nhật ${savedCount} trận đấu & cập nhật trạng thái mới nhất vào Supabase Database!`,
    count: savedCount
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey') || undefined;
    const result = await performSync(apiKey);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Cron sync GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await performSync(body.apiKey);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Manual sync POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
