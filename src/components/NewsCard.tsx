"use client";

import { ThumbsUp, ThumbsDown, MessageSquare, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Database } from '@/types/database';
import { useAuth } from '@clerk/nextjs';
import { SummaryStyle } from '@/lib/services/gpt-summary';
import { saveVote } from '@/lib/actions/votes';

type Article = Database['public']['Tables']['articles']['Row'];

interface NewsCardProps {
    article: Article & { userVote: boolean | null };
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    summary?: string;
}

export function NewsCard({ article }: NewsCardProps) {
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
        if (!isSignedIn) {
            alert('로그인이 필요합니다.');
            return;
        }
        if (isVoting) return;
        setIsVoting(true);
        try {
            await saveVote(article.id, voteType);
        } catch (error) {
            console.error('투표 실패:', error);
            alert('투표에 실패했습니다.');
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
                            <span className="text-sm">찬성</span>
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
                            <span className="text-sm">반대</span>
                        </button>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowSummary(!showSummary)}
                            className="flex items-center space-x-1 text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-md"
                        >
                            <MessageSquare size={18} />
                            <span className="text-sm">요약</span>
                        </button>
                        <button
                            onClick={() => setShowChat(!showChat)}
                            className="flex items-center space-x-1 text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-md"
                        >
                            <MessageSquare size={18} />
                            <span className="text-sm">대화</span>
                        </button>
                    </div>
                </div>

                {showSummary && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h3 className="text-md font-semibold mb-2">뉴스 요약</h3>
                        <div className="mb-2">
                            <label htmlFor="summary-style" className="sr-only">요약 스타일</label>
                            <select
                                id="summary-style"
                                value={summaryStyle}
                                onChange={(e) => setSummaryStyle(e.target.value as SummaryStyle)}
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="concise">간결하게</option>
                                <option value="detailed">자세하게</option>
                                <option value="bullet_points">핵심 요점</option>
                            </select>
                        </div>
                        <button
                            onClick={handleSummary}
                            disabled={loadingSummary || !article.content}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loadingSummary ? '요약 중...' : '요약하기'}
                        </button>
                        {summaryError && <p className="text-red-500 text-sm mt-2">Error: {summaryError}</p>}
                        {summary && <p className="mt-2 text-gray-700 whitespace-pre-wrap">{summary}</p>}
                    </div>
                )}

                {showChat && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h3 className="text-md font-semibold mb-2">기사와 대화하기</h3>
                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                            {chatMessages.length === 0 && !loadingChat && (
                                <p className="text-gray-500 text-sm">아직 대화 기록이 없습니다. 질문을 시작하세요!</p>
                            )}
                            {chatMessages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`p-2 rounded-md ${msg.role === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-100 text-gray-900 self-start'
                                        }`}
                                >
                                    <p className="text-sm"><strong>{msg.role === 'user' ? '나' : 'AI'}:</strong> {msg.content}</p>
                                    {msg.summary && <p className="text-xs text-gray-400 mt-1">요약: {msg.summary}</p>}
                                </div>
                            ))}
                            {loadingChat && (
                                <div className="p-2 rounded-md bg-gray-100 text-gray-900 self-start">
                                    <p className="text-sm">AI: 생각 중...</p>
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleChat} className="flex space-x-2">
                            <input
                                type="text"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                placeholder="기사에 대해 질문하세요..."
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                disabled={loadingChat}
                            />
                            <button
                                type="submit"
                                disabled={loadingChat || !chatMessage.trim()}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 disabled:opacity-50"
                            >
                                질문
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
} 