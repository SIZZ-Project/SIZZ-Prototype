"use client";

import { ThumbsUp, ThumbsDown, MessageSquare, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Database } from '@/types/database';
import { useAuth } from '@clerk/nextjs';
import { SummaryStyle } from '@/lib/services/gpt-summary';

type Article = Database['public']['Tables']['articles']['Row'];

interface NewsCardProps {
    article: Article & { userVote: boolean | null };
    onVote: (articleId: string, voteType: boolean) => Promise<void>;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    summary?: string;
}

export function NewsCard({ article, onVote }: NewsCardProps) {
    const { isSignedIn } = useAuth();
    const [isVoting, setIsVoting] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [summary, setSummary] = useState('');
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [summaryStyle, setSummaryStyle] = useState<SummaryStyle>('concise');
    const [chatMessage, setChatMessage] = useState('');
    const [chatResponse, setChatResponse] = useState('');
    const [loadingChat, setLoadingChat] = useState(false);

    // 대화형 분석 상태
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

    // 답변 요약 상태
    const [summaries, setSummaries] = useState<{ [idx: number]: string }>({});
    const [summaryLoading, setSummaryLoading] = useState<{ [idx: number]: boolean }>({});

    // 대화 히스토리 불러오기
    useEffect(() => {
        if (!isSignedIn || !showChat) return;
        (async () => {
            const res = await fetch(`/api/chat-history?articleId=${article.id}`);
            const data = await res.json();
            if (data.messages) setChatMessages(data.messages);
        })();
        // eslint-disable-next-line
    }, [isSignedIn, showChat, article.id]);

    // 대화 히스토리 저장
    useEffect(() => {
        if (!isSignedIn || !showChat) return;
        fetch('/api/chat-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articleId: article.id, messages: chatMessages }),
        });
        // eslint-disable-next-line
    }, [chatMessages, isSignedIn, showChat, article.id]);

    const handleVote = async (voteType: boolean) => {
        if (isVoting) return;
        setIsVoting(true);
        try {
            await onVote(article.id, voteType);
        } finally {
            setIsVoting(false);
        }
    };

    const getBiasColor = (bias: string) => {
        switch (bias) {
            case 'left':
                return 'bg-blue-100 text-blue-800';
            case 'right':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleSummary = async () => {
        setShowSummary(true);
        setLoadingSummary(true);
        setSummaryError(null);
        try {
            const res = await fetch('/api/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: article.content,
                    style: summaryStyle,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSummary(data.summary);
            } else {
                setSummaryError(data.error || '요약에 실패했습니다.');
            }
        } catch (e) {
            setSummaryError('요약 요청 중 오류가 발생했습니다.');
        } finally {
            setLoadingSummary(false);
        }
    };

    const handleChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        setLoadingChat(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: article.content,
                    question: chatMessage,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setChatResponse(data.response);
            } else {
                setChatResponse('대화 처리 중 오류가 발생했습니다.');
            }
        } catch (e) {
            setChatResponse('대화 요청 중 오류가 발생했습니다.');
        } finally {
            setLoadingChat(false);
        }
    };

    // 답변 요약 핸들러
    const handleSummaryAnswer = async (idx: number, answer: string) => {
        setSummaryLoading(s => ({ ...s, [idx]: true }));
        try {
            const res = await fetch('/api/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: answer }),
            });
            const data = await res.json();
            if (res.ok) {
                setSummaries(s => ({ ...s, [idx]: data.summary }));
            }
        } finally {
            setSummaryLoading(s => ({ ...s, [idx]: false }));
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBiasColor(article.bias)}`}>
                        {article.bias === 'left' ? '진보' : article.bias === 'right' ? '보수' : '중립'}
                    </span>
                    <span className="text-sm text-gray-500">
                        {article.published_at ? new Date(article.published_at).toLocaleDateString('ko-KR') : '날짜 없음'}
                    </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {article.title}
                </h2>

                <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.content}
                </p>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{article.source}</span>
                        <a
                            href={article.source_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <ExternalLink size={16} />
                        </a>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => handleVote(true)}
                            disabled={!isSignedIn || isVoting}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-md ${article.userVote === true
                                ? 'bg-green-100 text-green-800'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <ThumbsUp size={18} />
                            <span>찬성</span>
                        </button>
                        <button
                            onClick={() => handleVote(false)}
                            disabled={!isSignedIn || isVoting}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-md ${article.userVote === false
                                ? 'bg-red-100 text-red-800'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <ThumbsDown size={18} />
                            <span>반대</span>
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleSummary}
                            className="flex items-center space-x-1 px-3 py-1 rounded-md text-gray-600 hover:bg-gray-100"
                        >
                            <MessageSquare size={18} />
                            <span>요약</span>
                        </button>
                        <button
                            onClick={() => setShowChat(true)}
                            className="flex items-center space-x-1 px-3 py-1 rounded-md text-gray-600 hover:bg-gray-100"
                        >
                            <MessageSquare size={18} />
                            <span>대화</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 요약 모달 */}
            {showSummary && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
                        <button
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowSummary(false)}
                        >
                            ×
                        </button>
                        <h4 className="text-lg font-bold mb-4">GPT 요약</h4>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                요약 스타일
                            </label>
                            <select
                                value={summaryStyle}
                                onChange={(e) => setSummaryStyle(e.target.value as SummaryStyle)}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="concise">간단히 (1-2문장)</option>
                                <option value="detailed">자세히 (3-4문장)</option>
                                <option value="key-points">핵심 포인트 (3가지)</option>
                            </select>
                        </div>

                        {loadingSummary ? (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-2 text-gray-600">요약 중...</p>
                            </div>
                        ) : summaryError ? (
                            <div className="text-red-600">{summaryError}</div>
                        ) : (
                            <div className="prose max-w-none">
                                {summary || '요약을 생성하려면 요약 버튼을 클릭하세요.'}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 대화 모달 */}
            {showChat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
                        <button
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowChat(false)}
                        >
                            ×
                        </button>
                        <h4 className="text-lg font-bold mb-4">대화형 분석</h4>

                        <form onSubmit={handleChat} className="mb-4">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    placeholder="기사에 대해 질문하세요..."
                                    className="flex-1 border rounded px-3 py-2"
                                />
                                <button
                                    type="submit"
                                    disabled={loadingChat}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    전송
                                </button>
                            </div>
                        </form>

                        {loadingChat ? (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-2 text-gray-600">답변 생성 중...</p>
                            </div>
                        ) : (
                            <div className="prose max-w-none">
                                {chatResponse || '질문을 입력하고 전송 버튼을 클릭하세요.'}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 