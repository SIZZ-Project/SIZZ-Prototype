export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    clerk_id: string
                    nickname: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    clerk_id: string
                    nickname?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    clerk_id?: string
                    nickname?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            articles: {
                Row: {
                    id: string
                    title: string
                    content: string
                    source: string
                    source_url: string | null
                    category: string
                    bias: 'left' | 'center' | 'right'
                    summary: string | null
                    published_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    content: string
                    source: string
                    source_url?: string | null
                    category: string
                    bias: 'left' | 'center' | 'right'
                    summary?: string | null
                    published_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    content?: string
                    source?: string
                    source_url?: string | null
                    category?: string
                    bias?: 'left' | 'center' | 'right'
                    summary?: string | null
                    published_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            votes: {
                Row: {
                    id: string
                    user_id: string
                    article_id: string
                    vote_type: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    article_id: string
                    vote_type: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    article_id?: string
                    vote_type?: boolean
                    created_at?: string
                }
            }
            article_pairs: {
                Row: {
                    id: string
                    article1_id: string
                    article2_id: string
                    similarity_score: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    article1_id: string
                    article2_id: string
                    similarity_score?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    article1_id?: string
                    article2_id?: string
                    similarity_score?: number | null
                    created_at?: string
                }
            }
            chat_histories: {
                Row: {
                    id: string
                    user_id: string
                    article_id: string
                    messages: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    article_id: string
                    messages: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    article_id?: string
                    messages?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
} 