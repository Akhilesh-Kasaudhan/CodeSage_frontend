import moment from "moment";
import "prismjs/themes/prism-tomorrow.css";

export default function HistorySection({ item }) {
  // Reuse the same formatting function from ReviewResult
  const formatAIResponse = (text) => {
    if (!text) return text;

    return text
      .replace(/^# (.*$)/gm, '<h3 class="text-xl font-bold my-3">$1</h3>')
      .replace(/^## (.*$)/gm, '<h4 class="text-lg font-semibold my-2">$1</h4>')
      .replace(/^### (.*$)/gm, '<h5 class="font-medium my-2">$1</h5>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/^\s*-\s(.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\s*\*\s(.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\s*\d+\.\s(.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
        return `<pre class="language-${
          lang || "javascript"
        } bg-gray-800 rounded-md p-4 my-3 overflow-x-auto"><code>${code}</code></pre>`;
      })
      .replace(
        /`(.*?)`/g,
        '<code class="bg-gray-700 px-1 py-0.5 rounded text-sm">$1</code>'
      )
      .replace(/([^\n])\n([^\n])/g, "$1<br/>$2")
      .replace(/^\s*([^\n<].*$)/gm, '<p class="my-2">$1</p>')
      .replace(/^\s*---\s*$/gm, '<hr class="my-4 border-gray-600"/>');
  };

  return (
    <div className=" p-6 bg-gray-800 rounded-lg border border-gray-700 shadow-md">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-400">
          Language:{" "}
          <span className="font-medium text-gray-300">{item.language}</span>
        </p>
        {item.createdAt && (
          <p className="text-xs text-gray-500">
            {moment(item.createdAt).format("MMMM Do YYYY, h:mm:ss a")}
          </p>
        )}
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-300">Submitted Code:</h3>
        <div className="bg-gray-900 p-4 rounded-lg overflow-auto">
          <pre className="language-javascript bg-gray-900 rounded-md overflow-x-auto">
            <code className={`language-${item.language}`}>{item.code}</code>
          </pre>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3 text-gray-300">AI Review:</h3>
        <div
          className="bg-gray-900 p-4 rounded-lg overflow-auto text-gray-100 ai-response"
          dangerouslySetInnerHTML={{
            __html: formatAIResponse(item.reviewResult),
          }}
        />
      </div>
    </div>
  );
}
