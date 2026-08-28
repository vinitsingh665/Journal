import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export async function GET() {
  try {
    const now = new Date();
    const twoMinutesAgo = new Date(now.getTime() - 120000);

    // Fetch live users
    const liveUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gt: twoMinutesAgo,
        },
      },
    });

    // Calculate system health (simulated for now)
    const apiLatency = Math.floor(Math.random() * 20) + 15; // 15-35ms
    const errorRate = (Math.random() * 0.05).toFixed(2); // 0-0.05%
    const status = 'Operational';
    
    // Simulate active alerts
    const activeAlerts = 1428 + Math.floor(Math.random() * 10);
    
    // DB Load and Cache Hit Rate
    const databaseLoad = Math.min(100, Math.floor(5 + (liveUsers * 0.4) + (Math.random() * 5)));
    const cacheHitRate = Math.floor(88 + (Math.random() * 10));

    // Mock trending searches
    const trendingSearches = [
      { symbol: "HDFCBANK", count: 1240 },
      { symbol: "RELIANCE", count: 985 },
      { symbol: "INFY", count: 850 },
      { symbol: "TCS", count: 720 },
      { symbol: "ICICIBANK", count: 650 }
    ];

    return NextResponse.json({
      success: true,
      data: {
        liveUsers,
        activeAlerts,
        databaseLoad,
        cacheHitRate,
        systemHealth: {
          status,
          apiLatency: apiLatency,
          errorRate: `${Math.max(0, parseFloat(errorRate))}%`,
          uptime: '99.99%'
        },
        trendingSearches
      }
    });

  } catch (err) {
    console.error('Admin Stats API Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
