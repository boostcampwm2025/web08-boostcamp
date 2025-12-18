import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { githubLight } from "@fsegurai/codemirror-theme-github-light";
import { useYDoc } from "@/shared/lib/hooks/useYDoc";
import { yCollab } from 'y-codemirror.next';

export default function CodeEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { yText, awareness } = useYDoc('prototype');

  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc: yText.toString(),
      extensions: [
        basicSetup, 
        javascript(),
        yCollab(yText, awareness), 
        githubLight
      ],
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  return <div ref={editorRef} className="h-full" />;
}
