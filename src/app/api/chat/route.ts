import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { message } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // TODO: 여기에 실제 AI 응답 로직을 구현하세요
        // 현재는 간단한 에코 응답을 반환합니다
        const response = `메시지를 받았습니다: ${message}`;

        // 대화 기록 저장
        const supabase = createSupabaseClient();
        const { error } = await supabase
            .from('chat_history')
            .insert({
                user_id: userId,
                message,
                response,
                timestamp: new Date().toISOString()
            });

        if (error) {
            console.error('Error saving chat history:', error);
        }

        return NextResponse.json({ response });
    } catch (error) {
        console.error('Error in POST /api/chat:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 