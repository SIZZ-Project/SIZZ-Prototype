import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createSupabaseClient();
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('clerk_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // 사용자가 없으면 생성
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert({
                        clerk_id: userId,
                        nickname: '사용자',
                        preferences: {
                            notifications: {
                                email: true,
                                push: true
                            },
                            theme: 'system'
                        }
                    })
                    .select()
                    .single();

                if (createError) {
                    console.error('Error creating user:', createError);
                    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
                }

                return NextResponse.json(newUser);
            }
            console.error('Error fetching user:', error);
            return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in GET /api/user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const supabase = createSupabaseClient();
        const { data, error } = await supabase
            .from('users')
            .insert({
                ...body,
                clerk_id: userId
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating user:', error);
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in POST /api/user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const supabase = createSupabaseClient();
        const { data, error } = await supabase
            .from('users')
            .update(body)
            .eq('clerk_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating user:', error);
            return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in PUT /api/user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 