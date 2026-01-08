import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { githubLight } from "@fsegurai/codemirror-theme-github-light";
import { useYText } from "@/shared/lib/hooks/useYText";
import { yCollab } from "y-codemirror.next";

type Language = "javascript" | "html" | "css";

interface CodeEditorProps {
  fileId?: string;
  language?: Language;
  readOnly?: boolean;
}

const getLanguageExtension = (language: Language) => {
  switch (language) {
    case "javascript":
      return javascript({ jsx: true, typescript: true });
    case "html":
      return html();
    case "css":
      return css();
    default:
      return javascript({ jsx: true, typescript: true });
  }
};

export default function CodeEditor({
  fileId = "prototype",
  language = "javascript",
  readOnly = false,
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { yText, awareness } = useYText(fileId);

  useEffect(() => {
    if (!editorRef.current) return;

    // 기존 뷰가 있으면 정리
    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    // yText나 awareness가 없어도 기본 에디터는 렌더링 (Viewer도 코드를 볼 수 있어야 함)
    const docContent = yText ? yText.toString() : "";

    const extensions = [
      basicSetup,
      getLanguageExtension(language),
      githubLight,
      EditorState.readOnly.of(readOnly),
      EditorView.theme({
        "&": { height: "100%" },
        ".cm-scroller": { overflow: "auto" },
        ...(readOnly && {
          ".cm-cursor, .cm-dropCursor": { display: "none !important" },
          // ".cm-selectionBackground": { display: "none !important" },
          // ".cm-ySelectionCaret, .cm-ySelectionCaretDot": { display: "none !important" },
        }),
      }),
    ];

    // yText와 awareness가 모두 있을 때만 협업 기능 추가
    // yCollab은 Y.Text와 CodeMirror를 자동으로 동기화함
    if (yText && awareness) {
      extensions.push(yCollab(yText, awareness));
    }

    const view = new EditorView({
      doc: docContent,
      extensions,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [yText, awareness, language, readOnly]);

  return <div ref={editorRef} className="h-full" />;
}