import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    // 웹훅 시크릿 작성 여부 확인
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
        throw new Error('CLERK_WEBHOOK_SECRET is not set');
    }

    // 헤더에서 시그니처 가져오기
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', {
            status: 400
        });
    }

    // 웹훅 데이터 가져오기
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // 시그니처 검증
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new Response('Error occured', {
            status: 400
        });
    }

    // 사용자 생성 이벤트 처리
    if (evt.type === 'user.created') {
        const supabase = createSupabaseClient();
        const { error } = await supabase
            .from('users')
            .insert({
                clerk_id: evt.data.id,
                nickname: evt.data.username || evt.data.first_name || '사용자',
                preferences: {
                    notifications: {
                        email: true,
                        push: true
                    },
                    theme: 'system'
                }
            });

        if (error) {
            console.error('Error creating user in Supabase:', error);
            return new Response('Error creating user in Supabase', {
                status: 500
            });
        }
    }

    return new Response('Success', { status: 200 });
} 