# @codejam/cli

터미널에서 CodeJam 협업 코딩 룸을 빠르게 생성하고 관리하는 CLI 도구입니다.

## 설치

```bash
npm install -g @codejam/cli
```

## 사용법

### 빠른 시작

빠른 시작 (참여자 6명, 모두 에디터):

```bash
codejam start
```

출력 결과:

```
✔ Quick room created!

Room Code: ABCDEF
Environment: production

Opening https://codejam.kr/room/ABCDEF...
```

### 커스텀 룸

특정 설정으로 룸 생성:

```bash
codejam start --custom --max 50 --password mypass --host-password admin123
```

## 주요 옵션

### 커스텀 룸 옵션

- `--custom` - 빠른 시작 대신 커스텀 룸 생성
- `--max <숫자>` - 최대 참여자 수 (1-150, 기본값: 6)
- `--password <비밀번호>` - 참여자용 룸 비밀번호
- `--host-password <비밀번호>` - 호스트 권한용 비밀번호
- `--no-browser` - 룸 생성 후 브라우저 자동 열기 비활성화

## 사용 예시

### 비밀번호가 있는 커스텀 룸

```bash
codejam start --custom --max 30 --password secret123
```

### 대규모 강의용 커스텀 룸

```bash
codejam start --custom --max 150 --host-password teacher2026
```

## 서버 상태 확인

```bash
codejam health
```

## 문제 해결

### 명령어를 찾을 수 없음: codejam

설치 후 터미널을 재시작해주세요. 그래도 문제가 지속되면:

```bash
# 설치 확인
which codejam

# npm 전역 경로 확인
npm config get prefix
```

### 연결 오류

서버에 연결할 수 없는 경우 `codejam health` 명령어로 서버 상태를 확인하세요.

### 권한 오류

설치 시 권한 오류가 발생하면:

```bash
# npm 전역 디렉토리를 사용자 소유로 변경 (권장)
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# 다시 설치
npm install -g @codejam/cli
```

---

## 개발자를 위한 문서

CLI 개발, 로컬 테스트, 배포에 대한 자세한 정보는 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참고하세요.

## 라이선스

ISC

## 제작

JAMstack
