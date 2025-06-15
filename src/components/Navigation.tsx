'use client';

import Link from 'next/link';
import { NavigationClient } from './NavigationClient';

export function Navigation() {
    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold text-blue-600">
                            SIZZ
                        </Link>
                        <div className="ml-10 flex items-center space-x-4">
                            <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                홈
                            </Link>
                            <Link href="/my-bias" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                내 성향
                            </Link>
                            <Link href="/my-chats" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                대화 기록
                            </Link>
                        </div>
                    </div>
                    <NavigationClient />
                </div>
            </div>
        </nav>
    );
} 