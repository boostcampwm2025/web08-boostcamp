#!/bin/bash

TASKS="format lint check-types test build"

# 전체 태스크 목록 추출 (NONEXISTENT 제외)
ALL_TASKS=$(turbo run $TASKS --dry-run 2>&1 | awk '/^[a-zA-Z@\/._-]+#[a-z-]+$/{task=$0; next} /Command/{if (index($0,"NONEXISTENT")==0) print task}' | sed 's/#/:/')

LOG=$(mktemp)
# pipefail 설정을 통해 파이프라인 중 하나라도 실패하면 전체 실패로 간주 (turbo 실패 감지용)
set -o pipefail
turbo run $TASKS --force 2>&1 | tee "$LOG"
TURBO_EXIT_CODE=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Validate Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 실행된 태스크 추출
EXECUTED=$(grep -E 'cache (hit|miss|bypass)' "$LOG" | sed 's/: cache.*//' | awk '!seen[$0]++')

# 실패한 태스크 추출
FAILED_TURBO=$(grep 'Failed:' "$LOG" | grep -oE '[a-zA-Z@/._-]+#[a-z-]+' | sed 's/#/:/')
FAILED_ERROR=$(grep 'ERROR: command finished with error' "$LOG" | grep -oE '^[a-zA-Z@/._-]+:[a-z-]+' | sed 's/:$//')
FAILED=$(printf '%s\n%s' "$FAILED_TURBO" "$FAILED_ERROR" | grep -v '^$' | sort -u)

# 실행된 태스크 (실행 순서대로)
echo "$EXECUTED" | while read -r task; do
  [ -z "$task" ] && continue
  if echo "$FAILED" | grep -qxF "$task"; then
    echo "  ❌ $task"
  else
    echo "  ✅ $task"
  fi
done

# 실행되지 않은 태스크
echo "$ALL_TASKS" | while read -r task; do
  [ -z "$task" ] && continue
  if ! echo "$EXECUTED" | grep -qxF "$task"; then
    echo "  ⬚  $task"
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -n "$FAILED" ]; then
  echo "  Failed: $(echo "$FAILED" | tr '\n' ', ' | sed 's/,$//')"
  rm -f "$LOG"
  exit 1
elif [ $TURBO_EXIT_CODE -ne 0 ]; then
  echo "  ❌ Build failed (Turbo exited with error)"
  rm -f "$LOG"
  exit 1
else
  echo "  All tasks passed!"
  rm -f "$LOG"
  exit 0
fi
