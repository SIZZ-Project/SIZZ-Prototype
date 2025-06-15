import { supabase } from '../supabase/client';
import { Database } from '@/types/database';

export type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};

export async function getChatHistory(userId: string, articleId: string) {
    const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();
    if (error || !data) return null;
    const { id: user_id } = data;

    const { data: history } = await supabase
        .from('chat_histories')
        .select('messages, id')
        .eq('user_id', user_id)
        .eq('article_id', articleId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
    return history;
}

export async function saveChatHistory(userId: string, articleId: string, messages: ChatMessage[]) {
    const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();
    if (error || !data) return;
    const { id: user_id } = data;

    // upsert
    await supabase
        .from('chat_histories')
        .upsert({
            user_id,
            article_id: articleId,
            messages,
        });
}

export async function deleteChatHistory(userId: string, articleId: string) {
    const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();
    if (error || !data) return;
    const { id: user_id } = data;

    await supabase
        .from('chat_histories')
        .delete()
        .eq('user_id', user_id)
        .eq('article_id', articleId);
}

export async function getAllChatHistories(userId: string) {
    const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();
    if (error || !data) return [];
    const { id: user_id } = data;

    const { data: histories } = await supabase
        .from('chat_histories')
        .select(`
            id,
            article_id,
            messages,
            created_at,
            updated_at,
            articles (
                title,
                source,
                bias
            )
        `)
        .eq('user_id', user_id)
        .order('updated_at', { ascending: false });

    return histories || [];
} 