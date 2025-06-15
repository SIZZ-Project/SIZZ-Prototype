'use client';

import Link from 'next/link';
import { UserButton, SignInButton, useAuth } from '@clerk/nextjs';

export function NavigationClient() {
    const { isSignedIn } = useAuth();

    return (
        <div className="flex items-center space-x-4">
            {isSignedIn ? (
                <>
                    <Link
                        href="/my-profile"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                        프로필
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                </>
            ) : (
                <SignInButton mode="modal">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                        로그인
                    </button>
                </SignInButton>
            )}
        </div>
    );
} 