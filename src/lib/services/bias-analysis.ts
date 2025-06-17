import { supabase } from '../supabase/client';
import { Database } from '@/types/database';

type Article = Database['public']['Tables']['articles']['Row'];

interface BiasScore {
    left: number;
    center: number;
    right: number;
}

export async function calculateUserBias(userId: string): Promise<BiasScore> {
    try {
        // 사용자의 투표 기록과 관련 기사 정보를 가져옴
        const { data: votes, error: votesError } = await supabase
            .from('votes')
            .select(`
        vote_type,
        articles (
          bias
        )
      `)
            .eq('user_id', userId);

        if (votesError) throw votesError;

        // 초기 점수 설정
        const scores: BiasScore = {
            left: 0,
            center: 0,
            right: 0
        };

        // 투표 기록을 기반으로 점수 계산
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        votes?.forEach((vote: any) => {
            const bias = vote.articles?.bias;
            if (bias) {
                const weight = vote.vote_type ? 1 : -1; // 찬성은 +1, 반대는 -1
                scores[bias as keyof BiasScore] += weight;
            }
        });

        // 점수 정규화 (0-100 사이로)
        const totalVotes = votes?.length || 1;
        const normalizedScores: BiasScore = {
            left: ((scores.left + totalVotes) / (2 * totalVotes)) * 100,
            center: ((scores.center + totalVotes) / (2 * totalVotes)) * 100,
            right: ((scores.right + totalVotes) / (2 * totalVotes)) * 100
        };

        return normalizedScores;
    } catch (error) {
        console.error('성향 분석 에러:', error);
        throw error;
    }
}

export async function findOppositeBiasArticles(
    userId: string,
    limit: number = 3
): Promise<Article[]> {
    try {
        // 사용자의 성향 점수 계산
        const userBias = await calculateUserBias(userId);

        // 사용자의 주요 성향 결정
        const mainBias = Object.entries(userBias).reduce((a, b) =>
            a[1] > b[1] ? a : b
        )[0] as keyof BiasScore;

        // 반대 성향 결정
        const oppositeBias = mainBias === 'left' ? 'right' :
            mainBias === 'right' ? 'left' :
                Math.random() < 0.5 ? 'left' : 'right';

        // 반대 성향의 기사 조회
        const { data: articles, error } = await supabase
            .from('articles')
            .select('*')
            .eq('bias', oppositeBias)
            .order('published_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return articles || [];
    } catch (error) {
        console.error('반대 성향 기사 조회 에러:', error);
        throw error;
    }
}

export async function updateArticleBias(articleId: string): Promise<void> {
    try {
        // 해당 기사의 투표 통계 조회
        const { data: votes, error: votesError } = await supabase
            .from('votes')
            .select('vote_type')
            .eq('article_id', articleId);

        if (votesError) throw votesError;

        // 투표 결과를 기반으로 성향 결정
        const agreeCount = votes?.filter(v => v.vote_type).length || 0;
        const disagreeCount = votes?.filter(v => !v.vote_type).length || 0;
        const totalVotes = agreeCount + disagreeCount;

        let newBias: 'left' | 'center' | 'right';
        if (totalVotes < 5) {
            newBias = 'center'; // 투표가 적으면 중립으로 설정
        } else {
            const agreeRatio = agreeCount / totalVotes;
            if (agreeRatio > 0.6) {
                newBias = 'right';
            } else if (agreeRatio < 0.4) {
                newBias = 'left';
            } else {
                newBias = 'center';
            }
        }

        // 기사 성향 업데이트
        const { error: updateError } = await supabase
            .from('articles')
            .update({ bias: newBias })
            .eq('id', articleId);

        if (updateError) throw updateError;
    } catch (error) {
        console.error('기사 성향 업데이트 에러:', error);
        throw error;
    }
} 