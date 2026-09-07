import { NextResponse } from 'next/server';

export async function GET() {
  // Database-only mode: Standings are calculated dynamically from Supabase DB matches (0 API-Football requests consumed)
  return NextResponse.json({
    success: true,
    count: 0,
    data: []
  });
}
