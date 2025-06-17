import { getLatestNews } from '@/lib/services/news';
import { NewsCard } from '@/components/NewsCard';
import { getVoteForArticle } from '@/lib/services/votes';
import { Database } from '@/types/database';
import { auth } from '@clerk/nextjs/server';
import { saveVote } from '@/lib/actions/votes';
import { Navigation } from '@/components/Navigation';
import { TrendingUp, Shield, Users, Target } from 'lucide-react';

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

      {/* 히어로 배너 */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <TrendingUp className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              균형 잡힌
              <span className="block text-yellow-300">뉴스 소비</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              당신의 뉴스 성향을 분석하고, 다양한 관점의 기사를 추천하여
              <span className="font-semibold text-yellow-200"> 균형 잡힌 정보 소비</span>를 도와드립니다
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                뉴스 둘러보기
              </button>
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
                내 성향 분석하기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">개인화된 추천</h3>
              <p className="text-gray-600">AI가 분석한 당신의 성향에 맞는 뉴스를 추천해드립니다</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">신뢰할 수 있는 정보</h3>
              <p className="text-gray-600">검증된 뉴스 소스에서 제공하는 신뢰성 높은 정보입니다</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">다양한 관점</h3>
              <p className="text-gray-600">반대 성향의 기사도 함께 제시하여 균형 잡힌 시각을 제공합니다</p>
            </div>
          </div>
        </div>
      </section>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            최신 뉴스
          </h2>
          <p className="text-lg text-gray-600">
            오늘의 주요 뉴스를 확인하고 투표해보세요
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
              />
            ))}
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">SIZZ</h3>
            <p className="text-gray-400 mb-6">신뢰 기반 뉴스 추천 서비스</p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>© 2024 SIZZ. All rights reserved.</span>
              <span>•</span>
              <span>개인정보처리방침</span>
              <span>•</span>
              <span>이용약관</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
