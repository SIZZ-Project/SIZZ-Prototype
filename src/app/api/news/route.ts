import { NextResponse } from 'next/server';
import { fetchNews, saveNewsToDatabase, getLatestNews } from '@/lib/services/news';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || 'general';
        const refresh = searchParams.get('refresh') === 'true';

        if (refresh) {
            // 새로운 뉴스를 가져와서 데이터베이스에 저장
            const articles = await fetchNews(category);
            await saveNewsToDatabase(articles);
        }

        // 최신 뉴스 조회
        const news = await getLatestNews();
        return NextResponse.json({ news });
    } catch (error) {
        console.error('뉴스 API 에러:', error);
        return NextResponse.json(
            { error: '뉴스를 가져오는데 실패했습니다.' },
            { status: 500 }
        );
    }
} 