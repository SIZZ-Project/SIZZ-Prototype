import { auth } from '@clerk/nextjs/server';
import { Navigation } from '@/components/Navigation';

async function getUserBias() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/bias`, {
        cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
}

export default async function MyBiasPage() {
    const { userId } = await auth();
    if (!userId) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-2xl mx-auto py-20 text-center">
                    <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다.</h2>
                </div>
            </div>
        );
    }

    const biasData = await getUserBias();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                        내 뉴스 성향 분석
                    </h1>
                    <p className="text-xl text-gray-600">
                        당신의 뉴스 읽기 패턴을 분석한 결과입니다
                    </p>
                </div>

                {biasData ? (
                    <div className="grid gap-8 md:grid-cols-2">
                        {/* 성향 점수 */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold mb-4">성향 점수</h2>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-blue-600">진보</span>
                                        <span className="text-sm font-medium text-blue-600">{biasData.biasScores.left}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{ width: `${biasData.biasScores.left}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-red-600">보수</span>
                                        <span className="text-sm font-medium text-red-600">{biasData.biasScores.right}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-red-600 h-2.5 rounded-full"
                                            style={{ width: `${biasData.biasScores.right}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 추천 기사 */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold mb-4">다양한 관점 추천</h2>
                            <div className="space-y-4">
                                {biasData.oppositeArticles.map((article: { id: string; title: string; source: string; bias: string }) => (
                                    <div key={article.id} className="border-b pb-4 last:border-b-0">
                                        <h3 className="font-medium text-gray-900 mb-1">{article.title}</h3>
                                        <p className="text-sm text-gray-500">
                                            {article.source} · {article.bias === 'left' ? '진보' : article.bias === 'right' ? '보수' : '중립'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg shadow">
                        <p className="text-lg text-gray-600 mb-2">아직 충분한 데이터가 없습니다.</p>
                        <p className="text-sm text-gray-500">더 많은 기사를 읽고 투표해주세요.</p>
                    </div>
                )}
            </main>
        </div>
    );
} 