import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        const { articleId, voteType } = await request.json();

        // 사용자 정보 조회 또는 생성
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (userError && userError.code !== 'PGRST116') {
            throw userError;
        }

        let userIdInDb = userData?.id;

        if (!userIdInDb) {
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({ clerk_id: userId })
                .select('id')
                .single();

            if (createError) throw createError;
            userIdInDb = newUser.id;
        }

        // 투표 처리
        const { error: voteError } = await supabase
            .from('votes')
            .upsert({
                user_id: userIdInDb,
                article_id: articleId,
                vote_type: voteType,
            });

        if (voteError) throw voteError;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('투표 처리 에러:', error);
        return NextResponse.json(
            { error: '투표 처리에 실패했습니다.' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const articleId = searchParams.get('articleId');

        if (!articleId) {
            return NextResponse.json(
                { error: '기사 ID가 필요합니다.' },
                { status: 400 }
            );
        }

        // 사용자의 투표 정보 조회
        const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (!userData) {
            return NextResponse.json({ vote: null });
        }

        const { data: voteData } = await supabase
            .from('votes')
            .select('vote_type')
            .eq('user_id', userData.id)
            .eq('article_id', articleId)
            .single();

        return NextResponse.json({ vote: voteData?.vote_type ?? null });
    } catch (error) {
        console.error('투표 조회 에러:', error);
        return NextResponse.json(
            { error: '투표 조회에 실패했습니다.' },
            { status: 500 }
        );
    }
} 