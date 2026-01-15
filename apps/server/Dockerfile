# GitHub Actions에서 빌드된 결과물을 사용하는 경량 이미지
FROM node:22-slim

# 보안: non-root 유저 생성
RUN useradd -m -u 1001 appuser

WORKDIR /app

# production 의존성 파일만 복사
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/common/package.json ./packages/common/
COPY apps/server/package.json ./apps/server/

# production 의존성만 설치
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate \
    && pnpm install --frozen-lockfile --prod \
    && corepack disable

# 빌드된 결과물 복사 (GitHub Actions에서 빌드됨)
COPY packages/common/dist ./packages/common/dist
COPY apps/server/dist ./apps/server/dist

# 소유권 변경
RUN chown -R appuser:appuser /app

# non-root 유저로 전환
USER appuser

# 환경 변수 설정
ENV NODE_ENV=production

# 포트 개방
EXPOSE 3000

# 서버 실행
CMD ["node", "apps/server/dist/main.js"]
