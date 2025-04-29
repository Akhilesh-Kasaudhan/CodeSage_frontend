import { useEffect } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";

export default function CodeBlock({ language, code }) {
  useEffect(() => {
    Prism.highlightAll();
  }, [language, code]);

  return (
    <pre className="text-sm h-[500px] max-h-[800px] overflow-auto bg-gray-800 p-4 rounded-md">
      <code className={`language-${language}`}>{code}</code>
    </pre>
  );
}
