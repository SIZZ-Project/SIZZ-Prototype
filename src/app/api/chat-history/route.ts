import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getChatHistory, saveChatHistory, ChatMessage } from '@/lib/services/chat-history';

export async function GET(request: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');
    if (!articleId) return NextResponse.json({ error: 'articleId 필요' }, { status: 400 });
    const messages = await getChatHistory(userId, articleId);
    return NextResponse.json({ messages });
}

export async function POST(request: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
    const { articleId, messages } = await request.json();
    if (!articleId || !messages) return NextResponse.json({ error: '파라미터 부족' }, { status: 400 });
    await saveChatHistory(userId, articleId, messages as ChatMessage[]);
    return NextResponse.json({ ok: true });
}