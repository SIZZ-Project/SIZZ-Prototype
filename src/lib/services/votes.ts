import { supabase } from '../supabase/client';

export async function getVoteForArticle(articleId: string) {
    const { data, error } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('article_id', articleId)
        .single();

    if (error) return null;
    return data?.vote_type;
} 