export interface NewsArticle {
    title: string;
    content: string;
    source: string;
    sourceUrl: string;
    publishedAt: string;
    category: string;
}

export interface NewsApiResponse {
    status: string;
    totalResults: number;
    articles: NewsArticle[];
}

export interface NewsApiError {
    status: string;
    code: string;
    message: string;
} 