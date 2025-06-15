'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { createSupabaseClient } from '@/lib/supabase/server';
import { Navigation } from '@/components/Navigation';
import { ProfileForm } from '@/components/ProfileForm';

export default function MyProfilePage() {
    const { user, isLoaded } = useUser();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrCreateUser() {
            if (!isLoaded || !user) return;

            console.log('Current user ID:', user.id);

            try {
                // 사용자 데이터 조회
                const response = await fetch('/api/user');
                if (response.status === 404) {
                    // 데이터가 없으면 생성
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
                            }
                        }),
                    });

                    if (!createResponse.ok) {
                        throw new Error('Failed to create user data');
                    }

                    const newUserData = await createResponse.json();
                    setUserData(newUserData);
                } else if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchOrCreateUser();
    }, [isLoaded, user]);

    if (!isLoaded || loading) {
        return <div>로딩 중...</div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-2xl mx-auto py-20 text-center">
                    <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다.</h2>
                </div>
            </div>
        );
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