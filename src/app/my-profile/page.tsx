'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Navigation } from '@/components/Navigation';
import { ProfileForm } from '@/components/ProfileForm';

interface UserData {
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
}

export default function MyProfilePage() {
    const { user, isLoaded } = useUser();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrCreateUser() {
            if (!isLoaded || !user) return;

            console.log('Current user ID:', user.id);

            try {
                // 사용자 데이터 조회
                const response = await fetch('/api/user');
                let fetchedUserData = null;

                if (response.status === 404) {
                    // 데이터가 없으면 생성
                    console.log('User data not found, creating new user...');
                    const createResponse = await fetch('/api/user', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            clerk_id: user.id,
                            nickname: user.username || user.firstName || '사용자',
                            preferences: {
                                notifications: {
                                    email: true,
                                    push: true
                                },
                                theme: 'system'
                            },
                            bias: {
                                political: 'neutral',
                                economic: 'neutral',
                                social: 'neutral'
                            }
                        }),
                    });

                    if (!createResponse.ok) {
                        throw new Error('Failed to create user data');
                    }
                    fetchedUserData = await createResponse.json();
                    console.log('New user data created:', fetchedUserData);
                } else if (response.ok) {
                    fetchedUserData = await response.json();
                    console.log('Existing user data fetched:', fetchedUserData);
                } else {
                    throw new Error('Failed to fetch user data with status: ' + response.status);
                }

                // bias 데이터가 없는 경우 기본값 설정
                if (fetchedUserData && !fetchedUserData.bias) {
                    fetchedUserData.bias = {
                        political: 'neutral',
                        economic: 'neutral',
                        social: 'neutral'
                    };
                    console.log('Bias data initialized for existing user:', fetchedUserData.bias);
                }

                setUserData(fetchedUserData);

            } catch (error) {
                console.error('Error fetching or creating user:', error);
                // 에러 발생 시에도 빈 객체로 userData를 설정하여 ProfileForm이 crash되지 않도록 함
                setUserData({
                    nickname: '',
                    preferences: {
                        email_notifications: true,
                        push_notifications: true,
                        theme: 'system'
                    },
                    bias: {
                        political: 'neutral',
                        economic: 'neutral',
                        social: 'neutral'
                    }
                });
            } finally {
                setLoading(false);
            }
        }

        fetchOrCreateUser();
    }, [isLoaded, user]);

    if (!isLoaded || loading) {
        return <div>로딩 중...</div>;
    }

    // user가 null일 경우, 로그인 안내 메시지를 표시
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-2xl mx-auto py-20 text-center">
                    <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다.</h2>
                    <p className="text-gray-600">&apos;내 성향&apos; 페이지를 이용하려면 로그인해주세요.</p>
                </div>
            </div>
        );
    }

    // userData가 완전히 로드된 후에 ProfileForm 렌더링
    if (!userData) {
        return <div>사용자 데이터를 불러오는 중...</div>; // userData가 아직 null일 때 로딩 상태 표시
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="max-w-3xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                        내 프로필
                    </h1>
                    <p className="text-xl text-gray-600">
                        회원 정보를 관리하고 설정을 변경할 수 있습니다
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <ProfileForm initialData={userData} />
                </div>
            </main>
        </div>
    );
} 