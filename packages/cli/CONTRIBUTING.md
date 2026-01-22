# CLI 개발 가이드

@codejam/cli 패키지 개발 및 배포 가이드입니다.

## 개발 환경 설정

### 저장소 클론 및 설치

```bash
# 저장소 클론
git clone <repository-url>
cd code

# 의존성 설치
pnpm install

# CLI 패키지로 이동
cd packages/cli
```

### 로컬 개발

```bash
# 빌드
pnpm build

# 개발 모드 (Watch)
pnpm dev

# 타입 체크
pnpm check-types
```

### 로컬 테스트

전역 링크를 통해 로컬에서 CLI를 테스트할 수 있습니다:

```bash
# CLI 패키지를 전역으로 링크
pnpm link --global

# 이제 어디서든 codejam 명령어 사용 가능
codejam start --env local
codejam health --env local

# 링크 해제
pnpm unlink --global
```

## 프로젝트 구조

```
packages/cli/
├── src/
│   ├── api/                    # API 클라이언트
│   │   ├── client.ts          # HTTP 요청 로직
│   │   ├── types.ts           # API 타입 정의
│   │   └── index.ts
│   ├── commands/               # CLI 명령어
│   │   ├── start.ts           # start 명령어 (룸 생성)
│   │   ├── health.ts          # health 명령어 (서버 상태 확인)
│   │   └── index.ts
│   ├── config/                 # 환경 설정
│   │   ├── environments.ts    # 환경별 URL 설정
│   │   └── index.ts
│   └── index.ts                # CLI 진입점
├── dist/                       # 빌드 결과물 (tsup으로 생성)
├── package.json
├── tsconfig.json
├── README.md                   # 사용자용 문서
├── CONTRIBUTING.md             # 개발자용 문서 (이 파일)
└── PUBLISHING.md               # 배포 가이드
```

## 기술 스택

| 패키지     | 용도                 | 버전    |
| ---------- | -------------------- | ------- |
| commander  | CLI 프레임워크       | ^12.1.0 |
| chalk      | 터미널 색상 출력     | ^5.4.1  |
| ora        | 로딩 스피너          | ^8.1.1  |
| open       | 브라우저 자동 열기   | ^10.1.0 |
| tsup       | TypeScript 빌드 도구 | ^8.3.5  |
| typescript | 타입 시스템          | ^5.9.3  |

## 환경 설정

### 지원 환경

| 환경       | 서버 URL                         | 클라이언트 URL                   | 용도           |
| ---------- | -------------------------------- | -------------------------------- | -------------- |
| local      | http://localhost:3000            | http://localhost:5173            | 로컬 개발 환경 |
| staging    | https://staging.codejam.kro.kr   | https://staging.codejam.kro.kr   | 스테이징 서버  |
| production | https://production.codejam.kro.kr | https://production.codejam.kro.kr | 프로덕션 서버  |

환경 설정은 [src/config/environments.ts](src/config/environments.ts)에서 관리됩니다.

## API 엔드포인트

### Quick Room 생성

```http
POST {serverUrl}/api/rooms/quick
Content-Type: application/json
```

**응답:**

```json
{
  "roomCode": "ABCDEF",
  "token": "eyJhbGc..."
}
```

### Custom Room 생성

```http
POST {serverUrl}/api/rooms/custom
Content-Type: application/json

{
  "maxPts": 50,
  "roomPassword": "mypass",
  "hostPassword": "admin123"
}
```

**응답:**

```json
{
  "roomCode": "ABCDEF",
  "token": "eyJhbGc..."
}
```

### Health Check

```http
GET {serverUrl}/health
```

**응답:**

- 200 OK: 서버 정상
- 그 외: 서버 이상

## 빌드 프로세스

### tsup 설정

[package.json](package.json)의 빌드 스크립트:

```json
{
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts --clean --shims",
    "dev": "tsup src/index.ts --format esm --watch"
  }
}
```

**옵션 설명:**

- `--format esm`: ESM 모듈로 빌드
- `--dts`: TypeScript 선언 파일(.d.ts) 생성
- `--clean`: 빌드 전 dist 폴더 정리
- `--shims`: Node.js shim 추가 (import.meta.url 등)
- `--watch`: 파일 변경 감지 및 자동 재빌드

### 빌드 결과물

```
dist/
├── index.js          # 메인 번들 (실행 파일)
├── index.d.ts        # 타입 선언 파일
└── index.js.map      # 소스맵
```

## CI/CD

### CI (Continuous Integration)

PR 생성 시 자동 실행: [.github/workflows/ci.yml](../../.github/workflows/ci.yml)

```yaml
cli-check:
  - Type check CLI
  - Build CLI
  - Test CLI binary
```

### CD (Continuous Deployment)

태그 푸시 시 자동 배포: [.github/workflows/cli-publish.yml](../../.github/workflows/cli-publish.yml)

```bash
# 배포 프로세스
git tag cli-v1.0.1
git push origin cli-v1.0.1
→ GitHub Actions에서 자동으로 npm에 배포
```

자세한 배포 가이드는 [PUBLISHING.md](./PUBLISHING.md)를 참고하세요.

## 새로운 명령어 추가하기

### 1. 명령어 파일 생성

```typescript
// src/commands/mycommand.ts
import { Command } from 'commander';
import chalk from 'chalk';

interface MyCommandOptions {
  option1?: string;
}

export const myCommand = new Command('mycommand')
  .description('My new command description')
  .option('-o, --option1 <value>', 'Option description')
  .action(async (options: MyCommandOptions) => {
    try {
      console.log(chalk.green('Command executed!'));
    } catch (error) {
      console.error(chalk.red('Error occurred'));
      process.exit(1);
    }
  });
```

### 2. commands/index.ts에 export 추가

```typescript
// src/commands/index.ts
export * from './start.js';
export * from './health.js';
export * from './mycommand.js'; // 새 명령어 추가
```

### 3. 메인 파일에 등록

```typescript
// src/index.ts
import { startCommand, healthCommand, myCommand } from './commands/index.js';

program.addCommand(startCommand);
program.addCommand(healthCommand);
program.addCommand(myCommand); // 새 명령어 등록
```

### 4. 테스트

```bash
pnpm build
pnpm link --global
codejam mycommand --option1 value
```

## 디버깅

### VS Code 디버그 설정

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug CLI",
      "program": "${workspaceFolder}/packages/cli/dist/index.js",
      "args": ["start", "--env", "local"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### 로그 추가

```typescript
// 개발 중 디버깅용 로그
if (process.env.DEBUG) {
  console.log('Debug info:', data);
}
```

사용:

```bash
DEBUG=1 codejam start --env local
```

## 테스트

### 수동 테스트 체크리스트

- [ ] `codejam --version` 버전 출력 확인
- [ ] `codejam --help` 도움말 출력 확인
- [ ] `codejam start` Quick Room 생성 확인
- [ ] `codejam start --custom --max 50` Custom Room 생성 확인
- [ ] `codejam start --no-browser` 브라우저 미오픈 확인
- [ ] `codejam health` 서버 상태 확인
- [ ] `codejam start --env local` 로컬 환경 확인
- [ ] `codejam start --env staging` 스테이징 환경 확인
- [ ] `codejam start --env production` 프로덕션 환경 확인

## 문제 해결

### pnpm link 실패

```bash
# pnpm setup이 안 되어 있을 경우
pnpm setup
source ~/.zshrc
pnpm link --global
```

### 타입 에러

```bash
# node_modules 재설치
rm -rf node_modules
pnpm install

# 타입 체크
pnpm check-types
```

### 빌드 에러

```bash
# dist 폴더 정리 후 재빌드
rm -rf dist
pnpm build
```

## 코딩 컨벤션

### 파일 이름

- 소문자 kebab-case 사용
- TypeScript 파일: `.ts` 확장자

### Import 순서

1. Node.js 내장 모듈
2. 외부 패키지
3. 내부 모듈

```typescript
import { Command } from 'commander';
import chalk from 'chalk';
import { getConfig } from '../config/index.js';
```

### Error Handling

- 모든 async 함수에 try-catch 추가
- 실패 시 `process.exit(1)` 사용
- 사용자에게 명확한 에러 메시지 제공

```typescript
try {
  const result = await apiCall();
} catch (error) {
  console.error(chalk.red('Failed to create room'));
  if (error instanceof Error) {
    console.error(chalk.red(`Error: ${error.message}`));
  }
  process.exit(1);
}
```

## 릴리스 프로세스

자세한 내용은 [PUBLISHING.md](./PUBLISHING.md)를 참고하세요.

1. 버전 업데이트: `npm version patch|minor|major`
2. Tag 생성: `git tag cli-v1.0.1`
3. Tag 푸시: `git push origin cli-v1.0.1`
4. GitHub Actions에서 자동 배포

## 참고 자료

- [Commander.js 공식 문서](https://github.com/tj/commander.js)
- [Chalk 공식 문서](https://github.com/chalk/chalk)
- [tsup 공식 문서](https://tsup.egoist.dev/)
- [pnpm 공식 문서](https://pnpm.io/)
