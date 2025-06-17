import { NewsApiResponse, NewsArticle } from '@/types/news';
import { supabase } from '../supabase/client';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

export async function fetchNews(category: string = 'general', pageSize: number = 100): Promise<NewsArticle[]> {
    try {
        if (!NEWS_API_KEY) {
            console.error('뉴스 API 키가 설정되지 않았습니다. .env.local 파일에 NEWS_API_KEY를 추가해주세요.');
            return [];
        }

        console.log('뉴스 API 호출 시작:', `${NEWS_API_BASE_URL}/top-headlines?country=kr&category=${category}&pageSize=${pageSize}`);

        const response = await fetch(
            `${NEWS_API_BASE_URL}/top-headlines?country=kr&category=${category}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('뉴스 API 에러 응답:', errorData);
            throw new Error('뉴스를 가져오는데 실패했습니다.');
        }

        const data: NewsApiResponse = await response.json();
        console.log('받아온 뉴스 수:', data.articles.length);

        // 가져온 기사에 카테고리 정보 추가 (NewsAPI 응답에 카테고리가 명시되지 않으므로 요청 카테고리를 사용)
        return data.articles.map(article => ({
            ...article,
            category: category
        }));
    } catch (error) {
        console.error('뉴스 API 에러:', error);
        throw error;
    }
}

export async function saveNewsToDatabase(articles: NewsArticle[]) {
    try {
        // 중복 체크를 위한 기존 기사 제목 가져오기
        const { data: existingArticles } = await supabase
            .from('articles')
            .select('title');

        const existingTitles = new Set(existingArticles?.map(article => article.title) || []);

        // 중복되지 않은 기사만 필터링
        const newArticles = articles.filter(article => !existingTitles.has(article.title));

        if (newArticles.length === 0) {
            console.log('새로운 기사가 없습니다.');
            return [];
        }

        const { data, error } = await supabase
            .from('articles')
            .insert(
                newArticles.map(article => ({
                    title: article.title,
                    content: article.content || article.description || '',
                    source: article.source.name,
                    source_url: article.url,
                    // image_url: article.urlToImage, // articles 테이블에 image_url 컬럼이 없어 주석 처리합니다.
                    category: article.category || 'general', // fetchNews에서 추가된 카테고리 사용
                    published_at: article.publishedAt,
                    bias: 'neutral',
                    summary: article.description || article.content?.substring(0, 100) || '' // summary 컬럼에 데이터 추가
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
        // 먼저 데이터베이스에서 최신 뉴스를 가져옴
        const { data: dbArticles, error: dbError } = await supabase
            .from('articles')
            .select('*')
            .order('published_at', { ascending: false })
            .limit(limit);

        if (dbError) throw dbError;

        // 데이터베이스에 기사가 없거나 부족한 경우 API에서 가져옴
        if (!dbArticles || dbArticles.length < limit) {
            console.log('DB 기사 부족, API에서 추가 기사 가져오기...');
            const apiArticles = await fetchNews('general', 100); // 100개 기사를 요청
            const savedArticles = await saveNewsToDatabase(apiArticles);

            // API에서 가져온 기사와 DB 기사를 합침
            const allArticles = [...(dbArticles || []), ...savedArticles];
            return allArticles.slice(0, limit);
        }

        return dbArticles;
    } catch (error) {
        console.error('뉴스 조회 에러:', error);
        throw error;
    }
}

// 예제 뉴스 데이터 생성 함수 (현재 사용되지 않음)
export async function generateSampleNews() {
    const sampleArticles: NewsArticle[] = [
        {
            title: "삼성전자, 2분기 실적 발표...반도체 부문 회복세",
            description: "삼성전자가 2분기 실적을 발표했다. 반도체 부문이 회복세를 보이며 전년 대비 10% 성장했다.",
            content: "삼성전자가 2분기 실적을 발표했다. 반도체 부문이 회복세를 보이며 전년 대비 10% 성장했다. 특히 AI 반도체 수요 증가로 인한 실적 개선이 두드러졌다.",
            url: "https://example.com/news/1",
            urlToImage: "https://example.com/images/samsung.jpg",
            publishedAt: new Date().toISOString(),
            source: { id: "1", name: "경제일보" },
            category: "business"
        },
        {
            title: "코로나19 신규 확진자 100명대로 감소",
            description: "국내 코로나19 신규 확진자가 100명대로 감소했다.",
            content: "국내 코로나19 신규 확진자가 100명대로 감소했다. 방역당국은 방역 수칙 준수를 당부했다.",
            url: "https://example.com/news/2",
            urlToImage: "https://example.com/images/covid.jpg",
            publishedAt: new Date().toISOString(),
            source: { id: "2", name: "건강신문" },
            category: "health"
        },
        {
            title: "K-팝 그룹 BTS, 월드투어 성공적 마무리",
            description: "BTS가 월드투어를 성공적으로 마무리했다.",
            content: "BTS가 전 세계 20개 도시에서 열린 월드투어를 성공적으로 마무리했다. 총 200만명의 관객이 참여했다.",
            url: "https://example.com/news/3",
            urlToImage: "https://example.com/images/bts.jpg",
            publishedAt: new Date().toISOString(),
            source: { id: "3", name: "연예뉴스" },
            category: "entertainment"
        },
        {
            title: "새로운 AI 기술 개발로 의료 진단 정확도 향상",
            description: "국내 연구팀이 새로운 AI 기술을 개발해 의료 진단 정확도를 크게 향상시켰다.",
            content: "국내 연구팀이 새로운 AI 기술을 개발해 의료 진단 정확도를 95%까지 향상시켰다. 이 기술은 조기 암 진단에 특히 효과적이다.",
            url: "https://example.com/news/4",
            urlToImage: "https://example.com/images/ai.jpg",
            publishedAt: new Date().toISOString(),
            source: { id: "4", name: "과학일보" },
            category: "science"
        },
        {
            title: "한국 축구, 월드컵 예선 첫 승리",
            description: "한국 축구대표팀이 월드컵 예선 첫 경기에서 승리를 거뒀다.",
            content: "한국 축구대표팀이 월드컵 예선 첫 경기에서 2-0 승리를 거뒀다. 손흥민 선수가 두 골을 기록했다.",
            url: "https://example.com/news/5",
            urlToImage: "https://example.com/images/soccer.jpg",
            publishedAt: new Date().toISOString(),
            source: { id: "5", name: "스포츠투데이" },
            category: "sports"
        }
    ];

    // 현재 날짜 기준으로 과거 30일 동안의 날짜 생성
    const dates = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString();
    });

    // 100개의 예제 기사 생성
    const articles: NewsArticle[] = [];
    for (let i = 0; i < 100; i++) {
        const baseArticle = sampleArticles[i % sampleArticles.length];
        const date = dates[i % dates.length];

        articles.push({
            ...baseArticle,
            title: `${baseArticle.title} (${i + 1})`,
            publishedAt: date,
            url: `${baseArticle.url}?id=${i + 1}`,
            urlToImage: `${baseArticle.urlToImage}?id=${i + 1}`
        });
    }

    return articles;
} 