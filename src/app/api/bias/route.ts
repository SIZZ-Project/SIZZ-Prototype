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
            .select('bias')
            .eq('clerk_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // 사용자가 없으면 기본값 반환
                return NextResponse.json({
                    bias: {
                        political: 'neutral',
                        economic: 'neutral',
                        social: 'neutral'
                    }
                });
            }
            console.error('Error fetching bias:', error);
            return NextResponse.json({ error: 'Failed to fetch bias' }, { status: 500 });
        }

        return NextResponse.json(data.bias || {
            political: 'neutral',
            economic: 'neutral',
            social: 'neutral'
        });
    } catch (error) {
        console.error('Error in GET /api/bias:', error);
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
            .update({ bias: body })
            .eq('clerk_id', userId)
            .select('bias')
            .single();

        if (error) {
            console.error('Error updating bias:', error);
            return NextResponse.json({ error: 'Failed to update bias' }, { status: 500 });
        }

        return NextResponse.json(data.bias);
    } catch (error) {
        console.error('Error in PUT /api/bias:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 