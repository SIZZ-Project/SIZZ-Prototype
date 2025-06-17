import { NextResponse } from 'next/server';
import { generateSampleNews, saveNewsToDatabase } from '@/lib/services/news';

export async function GET() {
    try {
        // 예제 뉴스 데이터 생성
        const sampleArticles = await generateSampleNews();

        // 데이터베이스에 저장
        const savedArticles = await saveNewsToDatabase(sampleArticles);

        return NextResponse.json({
            success: true,
            message: `${savedArticles.length}개의 새로운 기사가 저장되었습니다.`,
            articles: savedArticles
        });
    } catch (error) {
        console.error('뉴스 업데이트 에러:', error);
        return NextResponse.json(
            { success: false, message: '뉴스 업데이트 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
} 