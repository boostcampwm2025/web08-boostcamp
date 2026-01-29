import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import './markdown.css';

type MarkdownContentProps = {
  content: string;
};

/**
 * 마크다운 렌더링 컴포넌트
 * - react-markdown: 마크다운 → React 컴포넌트 변환
 * - remark-gfm: GFM 문법 지원 (테이블, 취소선 등)
 * - rehype-highlight: 코드 블록 문법 강조
 */
export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="markdown-content prose prose-sm dark:prose-invert max-w-none wrap-break-word">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
