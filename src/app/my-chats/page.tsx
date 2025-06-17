import { auth } from '@clerk/nextjs/server';
import { Navigation } from '@/components/Navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';

async function getChatHistories() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/chat-history`, {
        cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.histories || [];
}

export default async function MyChatsPage() {
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

    const histories = await getChatHistories();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="max-w-3xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold mb-8 text-center">나의 대화 히스토리</h1>

                {histories.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        아직 저장된 대화가 없습니다.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {histories.map((history: {
                            id: string;
                            article_id: string;
                            updated_at: string;
                            messages: Array<{ content: string }>;
                            articles?: {
                                title?: string;
                                source?: string;
                                bias?: string
                            }
                        }) => (
                            <div key={history.id} className="bg-white rounded-lg shadow p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            {history.articles?.title || '제목 없음'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {history.articles?.source} ·
                                            {history.articles?.bias === 'left' ? '진보' :
                                                history.articles?.bias === 'right' ? '보수' : '중립'}
                                        </p>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {format(new Date(history.updated_at), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                                    </div>
                                </div>

                                <div className="mt-2 text-sm text-gray-600">
                                    마지막 대화: {history.messages[history.messages.length - 1]?.content.slice(0, 100)}...
                                </div>

                                <div className="mt-4 flex justify-end space-x-2">
                                    <Link
                                        href={`/article/${history.article_id}`}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                                    >
                                        기사 보기
                                    </Link>
                                    <button
                                        onClick={async () => {
                                            if (confirm('정말로 이 대화를 삭제하시겠습니까?')) {
                                                await fetch(`/api/chat-history?articleId=${history.article_id}`, {
                                                    method: 'DELETE',
                                                });
                                                window.location.reload();
                                            }
                                        }}
                                        className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
} 