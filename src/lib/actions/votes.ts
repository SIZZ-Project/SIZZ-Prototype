'use server';

import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

export async function saveVote(articleId: string, voteType: boolean) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error('인증되지 않은 사용자입니다.');
    }

    // Supabase의 users 테이블에서 user_id를 가져오거나 생성합니다.
    const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert(
            { clerk_id: userId },
            { onConflict: 'clerk_id' }
        )
        .select('id')
        .single();

    if (userError || !userData) {
        throw new Error(`사용자 정보를 가져오거나 저장하는 데 실패했습니다: ${userError?.message}`);
    }

    const { id: user_id } = userData;

    const { error: voteError } = await supabase
        .from('votes')
        .upsert(
            { user_id, article_id: articleId, vote_type: voteType, created_at: new Date().toISOString() },
            { onConflict: 'user_id, article_id' }
        );

    if (voteError) {
        throw new Error(`투표 저장에 실패했습니다: ${voteError.message}`);
    }
} 