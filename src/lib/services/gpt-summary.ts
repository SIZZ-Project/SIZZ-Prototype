import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export type SummaryStyle = 'concise' | 'detailed' | 'key-points';

const SUMMARY_PROMPTS = {
    concise: '다음 내용을 1-2문장으로 간단히 요약해줘:',
    detailed: '다음 내용을 3-4문장으로 자세히 요약해줘:',
    'key-points': '다음 내용의 핵심 포인트를 3가지로 나열해줘:',
};

export async function summarizeArticle(content: string, style: SummaryStyle = 'concise'): Promise<string> {
    const prompt = `${SUMMARY_PROMPTS[style]}\n\n${content}`;
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: '당신은 뉴스 요약 전문가입니다.' },
            { role: 'user', content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.5,
    });
    return response.choices[0].message?.content?.trim() || '';
} 