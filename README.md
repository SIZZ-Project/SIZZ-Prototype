# SIZZ - 신뢰 기반 뉴스 추천 서비스

신뢰도 높은 뉴스를 사용자 성향 기반으로 추천하고, 반대 성향의 기사도 함께 제시하여 균형 있는 정보 소비를 유도하는 플랫폼입니다.

## 기술 스택

- Frontend: Next.js (App Router) + Tailwind CSS + shadcn/ui
- Backend: Supabase (PostgreSQL)
- Auth: Clerk
- AI/NLP: OpenAI API (GPT-4)
- 배포: Vercel, Supabase Hosting

## 시작하기

1. 저장소를 클론합니다:
```bash
git clone [repository-url]
cd sizz-prototype
```

2. 의존성을 설치합니다:
```bash
npm install
```

3. 환경 변수를 설정합니다:
`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# News API
NEWS_API_KEY=
```

4. 개발 서버를 실행합니다:
```bash
npm run dev
```

## 주요 기능

- 사용자 인증 (Clerk)
- 뉴스 기사 목록 조회
- 뉴스 상세 보기
- 찬반 투표 시스템
- 개인 성향 분석 및 시각화
- 반대 성향 뉴스 매칭
- AI 기반 기사 요약

## 데이터베이스 구조

### users
- id (UUID)
- nickname (TEXT)
- created_at (TIMESTAMP)

### articles
- id (UUID)
- title (TEXT)
- content (TEXT)
- source (TEXT)
- category (TEXT)
- bias (TEXT)
- summary (TEXT)

### votes
- id (UUID)
- user_id (UUID)
- article_id (UUID)
- vote_type (BOOLEAN)
- created_at (TIMESTAMP)

## 라이선스

MIT
