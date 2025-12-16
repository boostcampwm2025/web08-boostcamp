import { Header } from "./widgets/header";
import { CodeEditor } from "./widgets/code-editor";

function App() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-hidden">
        <CodeEditor />
      </main>
    </div>
  );
}

export default App;
