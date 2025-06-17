'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProfileFormProps {
    initialData?: {
        nickname?: string;
        preferences?: {
            email_notifications?: boolean;
            push_notifications?: boolean;
            theme?: 'light' | 'dark' | 'system';
        };
        bias?: {
            political?: 'left' | 'center' | 'right' | 'neutral';
            economic?: 'liberal' | 'conservative' | 'neutral';
            social?: 'liberal' | 'conservative' | 'neutral';
        };
    };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        nickname: initialData?.nickname || '',
        preferences: {
            email_notifications: initialData?.preferences?.email_notifications ?? true,
            push_notifications: initialData?.preferences?.push_notifications ?? true,
            theme: initialData?.preferences?.theme || 'system',
        },
        bias: {
            political: initialData?.bias?.political || 'neutral',
            economic: initialData?.bias?.economic || 'neutral',
            social: initialData?.bias?.social || 'neutral',
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/user', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error('프로필 업데이트에 실패했습니다.');
            }

            router.refresh();
            alert('프로필이 성공적으로 업데이트되었습니다.');
        } catch (error) {
            console.error('프로필 업데이트 에러:', error);
            alert('프로필 업데이트에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                    닉네임
                </label>
                <input
                    type="text"
                    id="nickname"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                />
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">알림 설정</h3>
                <div className="space-y-4">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="email_notifications"
                            checked={formData.preferences.email_notifications}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    preferences: {
                                        ...formData.preferences,
                                        email_notifications: e.target.checked,
                                    },
                                })
                            }
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="email_notifications" className="ml-2 block text-sm text-gray-700">
                            이메일 알림 받기
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="push_notifications"
                            checked={formData.preferences.push_notifications}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    preferences: {
                                        ...formData.preferences,
                                        push_notifications: e.target.checked,
                                    },
                                })
                            }
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="push_notifications" className="ml-2 block text-sm text-gray-700">
                            푸시 알림 받기
                        </label>
                    </div>
                </div>
            </div>

            <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                    테마
                </label>
                <select
                    id="theme"
                    value={formData.preferences.theme}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            preferences: {
                                ...formData.preferences,
                                theme: e.target.value as 'light' | 'dark' | 'system',
                            },
                        })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="light">라이트 모드</option>
                    <option value="dark">다크 모드</option>
                    <option value="system">시스템 설정 따르기</option>
                </select>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">내 뉴스 성향</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="political-bias" className="block text-sm font-medium text-gray-700">
                            정치적 성향
                        </label>
                        <select
                            id="political-bias"
                            value={formData.bias.political}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    bias: {
                                        ...formData.bias,
                                        political: e.target.value as 'left' | 'center' | 'right' | 'neutral',
                                    },
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="neutral">중립</option>
                            <option value="left">좌파</option>
                            <option value="center">중도</option>
                            <option value="right">우파</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="economic-bias" className="block text-sm font-medium text-gray-700">
                            경제적 성향
                        </label>
                        <select
                            id="economic-bias"
                            value={formData.bias.economic}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    bias: {
                                        ...formData.bias,
                                        economic: e.target.value as 'liberal' | 'conservative' | 'neutral',
                                    },
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="neutral">중립</option>
                            <option value="liberal">진보</option>
                            <option value="conservative">보수</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="social-bias" className="block text-sm font-medium text-gray-700">
                            사회적 성향
                        </label>
                        <select
                            id="social-bias"
                            value={formData.bias.social}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    bias: {
                                        ...formData.bias,
                                        social: e.target.value as 'liberal' | 'conservative' | 'neutral',
                                    },
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="neutral">중립</option>
                            <option value="liberal">진보</option>
                            <option value="conservative">보수</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                    {isLoading ? '저장 중...' : '저장하기'}
                </button>
            </div>
        </form>
    );
} 