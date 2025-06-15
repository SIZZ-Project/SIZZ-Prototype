import { NewsApiResponse, NewsArticle } from '@/types/news';
import { supabase } from '../supabase/client';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

export async function fetchNews(category: string = 'general'): Promise<NewsArticle[]> {
    try {
        const response = await fetch(
            `${NEWS_API_BASE_URL}/top-headlines?country=kr&category=${category}&apiKey=${NEWS_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('뉴스를 가져오는데 실패했습니다.');
        }

        const data: NewsApiResponse = await response.json();
        return data.articles;
    } catch (error) {
        console.error('뉴스 API 에러:', error);
        throw error;
    }
}

export async function saveNewsToDatabase(articles: NewsArticle[]) {
    try {
        const { data, error } = await supabase
            .from('articles')
            .insert(
                articles.map(article => ({
                    title: article.title,
                    content: article.content,
                    source: article.source,
                    source_url: article.sourceUrl,
                    category: article.category,
                    published_at: article.publishedAt,
                    // 초기에는 중립으로 설정
                    bias: 'center'
                }))
            )
            .select();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('데이터베이스 저장 에러:', error);
        throw error;
    }
}

export async function getLatestNews(limit: number = 10) {
    try {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('published_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('뉴스 조회 에러:', error);
        throw error;
    }
} 