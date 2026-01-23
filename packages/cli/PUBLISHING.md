# Publishing @codejam/cli

## Prerequisites

1. **npm 계정** - npm에 로그인되어 있어야 함
2. **npm 토큰** - GitHub Secrets에 `NPM_TOKEN` 설정
3. **권한** - @codejam scope에 publish 권한

## Setup npm Token

1. npm 토큰 생성:

   ```bash
   npm login
   npm token create
   ```

2. GitHub Repository Settings > Secrets에 추가:
   - Name: `NPM_TOKEN`
   - Value: `npm_xxxxxxxxxxxxx`

## Publishing Process

### 1. 버전 업데이트

```bash
cd packages/cli

# 버전 업데이트 (patch, minor, major)
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

### 2. Tag 생성 및 푸시

```bash
# 현재 버전 확인
cat package.json | grep version

# Tag 생성
git tag cli-v1.0.1

# Tag 푸시 (자동으로 GitHub Actions 트리거됨)
git push origin cli-v1.0.1
```

### 3. GitHub Actions 확인

- Actions 탭에서 "Publish CLI to npm" 워크플로우 확인
- 빌드 성공 후 npm에 자동 배포

### 4. 배포 확인

```bash
# npm에서 확인
npm view @codejam/cli

# 설치 테스트
npm install -g @codejam/cli@latest
codejam --version
```

## Manual Publishing (비추천)

자동 배포가 안 될 경우:

```bash
cd packages/cli

# 빌드
pnpm build

# 로그인 확인
npm whoami

# 배포
npm publish --access public
```

## Troubleshooting

### "You do not have permission to publish"

- npm 계정이 @codejam scope에 권한이 있는지 확인
- `npm whoami`로 로그인 확인

### "Version already exists"

- package.json 버전을 올리지 않고 배포 시도한 경우
- `npm version patch`로 버전 업데이트

### GitHub Actions 실패

- Secrets의 NPM_TOKEN이 올바른지 확인
- 토큰이 만료되지 않았는지 확인
- Repository Settings > Actions > Permissions 확인

## Version Strategy

- **Patch (1.0.x)**: 버그 수정
- **Minor (1.x.0)**: 새 기능 추가 (하위 호환)
- **Major (x.0.0)**: Breaking changes

## Changelog

버전 업데이트 시 CHANGELOG.md에 변경사항 기록:

```markdown
## [1.0.1] - 2026-01-22

### Fixed

- Fixed health check timeout issue

### Added

- Added --no-browser option to start command
```
