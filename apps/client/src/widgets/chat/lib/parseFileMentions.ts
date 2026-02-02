/**
 * 메시지 세그먼트 타입
 * - text: 일반 텍스트 (마크다운 포함)
 * - file: 파일 언급 (@fileName)
 */
export type Segment =
  | { type: 'text'; text: string }
  | { type: 'file'; fileName: string };

/**
 * @[fileName] 패턴 매칭 정규식
 */
const FILE_MENTION_REGEX = /@\[([^\]]+)\]/g;

/**
 * 메시지 content를 파싱하여 세그먼트 배열로 변환
 *
 * @example
 * parseFileMentions("확인해줘 @[main.ts] 여기!")
 * // → [
 * //     { type: 'text', text: '확인해줘 ' },
 * //     { type: 'file', fileName: 'main.ts' },
 * //     { type: 'text', text: ' 여기!' }
 * //   ]
 */
export function parseFileMentions(content: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(FILE_MENTION_REGEX)) {
    const matchIndex = match.index!;

    // 이전 텍스트 추가
    if (matchIndex > lastIndex) {
      segments.push({
        type: 'text',
        text: content.slice(lastIndex, matchIndex),
      });
    }

    // 파일 언급 추가 (match[1] = fileName)
    segments.push({ type: 'file', fileName: match[1] });

    lastIndex = matchIndex + match[0].length;
  }

  // 나머지 텍스트 추가
  if (lastIndex < content.length) {
    segments.push({ type: 'text', text: content.slice(lastIndex) });
  }

  // 빈 경우 전체를 텍스트로
  return segments.length > 0 ? segments : [{ type: 'text', text: content }];
}
