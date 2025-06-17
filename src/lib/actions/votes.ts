'use server';

import { createSupabaseClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function saveVote(articleId: string, voteType: boolean) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('Unauthorized');
    }

    const supabase = createSupabaseClient();

    // 기존 투표 확인
    const { data: existingVote, error: fetchError } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', userId)
        .eq('article_id', articleId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing vote:', fetchError);
        throw new Error('기존 투표를 가져오는 데 실패했습니다.');
    }

    if (existingVote) {
        // 투표가 이미 존재하면 업데이트
        const { error: updateError } = await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);

        if (updateError) {
            console.error('Error updating vote:', updateError);
            throw new Error('투표 업데이트에 실패했습니다.');
        }
    } else {
        // 투표가 없으면 삽입
        const { error: insertError } = await supabase
            .from('votes')
            .insert({
                user_id: userId,
                article_id: articleId,
                vote_type: voteType,
            });

        if (insertError) {
            console.error('Error inserting vote:', insertError);
            throw new Error('투표 저장에 실패했습니다.');
        }
    }

    // 캐시 재검증 (선택사항: 투표 후 즉시 UI 업데이트를 위해)
    revalidatePath('/');
} 