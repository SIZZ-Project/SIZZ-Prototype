import { getLatestNews } from '@/lib/services/news';
import { NewsCard } from '@/components/NewsCard';
import { getVoteForArticle } from '@/lib/services/votes';
import { Database } from '@/types/database';
import { auth } from '@clerk/nextjs/server';
import { saveVote } from '@/lib/actions/votes';
import { Navigation } from '@/components/Navigation';

type Article = Database['public']['Tables']['articles']['Row'];

export default async function Home() {
  const { userId } = await auth();
  const articles = await getLatestNews();
  const votes = await Promise.all(
    articles.map(article => getVoteForArticle(article.id))
  );

  const articlesWithVotes = articles.map((article, index) => ({
    ...article,
    userVote: votes[index],
  }));

  const handleVote = async (articleId: string, voteType: boolean) => {
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      await saveVote(articleId, voteType);
    } catch (error) {
      console.error('투표 실패:', error);
      alert('투표에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            SIZZ 뉴스 피드
          </h1>
          <p className="text-xl text-gray-600">
            당신의 뉴스 성향을 분석하고 맞춤형 뉴스를 추천해드립니다
          </p>
        </div>

        {articlesWithVotes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <p className="text-lg text-gray-600 mb-2">현재 표시할 뉴스가 없습니다.</p>
            <p className="text-sm text-gray-500">새로운 뉴스가 곧 업데이트됩니다.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {articlesWithVotes.map(article => (
              <NewsCard
                key={article.id}
                article={article}
                onVote={handleVote}
              />
            ))}
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2024 SIZZ. All rights reserved.</p>
            <p className="mt-2">신뢰 기반 뉴스 추천 서비스</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
