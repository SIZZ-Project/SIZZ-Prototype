import { NextResponse } from 'next/server';
import { summarizeArticle } from '@/lib/services/gpt-summary';

export async function POST(request: Request) {
    try {
        const { content } = await request.json();
        if (!content) {
            return NextResponse.json({ error: '본문이 필요합니다.' }, { status: 400 });
        }
        const summary = await summarizeArticle(content);
        return NextResponse.json({ summary });
    } catch (error) {
        console.error('요약 에러:', error);
        return NextResponse.json({ error: '요약에 실패했습니다.' }, { status: 500 });
    }
} 