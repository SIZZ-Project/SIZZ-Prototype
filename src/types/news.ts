export interface NewsArticle {
    title: string;
    content?: string;
    description?: string;
    source: {
        id: string | null;
        name: string;
    };
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    category?: string;
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