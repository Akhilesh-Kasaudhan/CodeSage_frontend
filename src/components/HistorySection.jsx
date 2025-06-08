import React, { useState } from "react";
import {
  Calendar,
  Code,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function HistorySection({ item }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedReview, setCopiedReview] = useState(false);
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);
  const [isReviewExpanded, setIsReviewExpanded] = useState(true);

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "code") {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedReview(true);
        setTimeout(() => setCopiedReview(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy to clipboard");
    }
  };

  const formatAIResponse = (text) => {
    if (!text) return text;

    return (
      text
        // Clean up extra whitespace
        .replace(/\n\s*\n\s*\n/g, "\n\n")

        // Headers with better styling
        .replace(
          /^### (.*$)/gm,
          '<h5 class="text-lg font-semibold my-4 text-blue-300 border-l-4 border-blue-400 pl-3">$1</h5>'
        )
        .replace(
          /^## (.*$)/gm,
          '<h4 class="text-xl font-bold my-5 text-purple-300 border-l-4 border-purple-400 pl-3">$1</h4>'
        )
        .replace(
          /^# (.*$)/gm,
          '<h3 class="text-2xl font-bold my-6 text-cyan-300 border-l-4 border-cyan-400 pl-3">$1</h3>'
        )

        // Enhanced code blocks
        .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
          const language = lang || "javascript";
          const trimmedCode = code.trim();

          return `
          <div class="relative my-6 rounded-xl overflow-hidden border border-gray-600/50 shadow-lg">
            <div class="flex items-center justify-between bg-gray-700/80 px-4 py-2 border-b border-gray-600/50">
              <span class="text-xs font-medium text-gray-300 flex items-center gap-2">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                </svg>
                ${language.toUpperCase()}
              </span>
            </div>
            <pre class="bg-gray-800 text-sm p-4 overflow-x-auto"><code class="text-gray-100">${trimmedCode}</code></pre>
          </div>
        `;
        })

        // Bold text
        .replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="font-semibold text-white">$1</strong>'
        )

        // Italic text
        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>')

        // Inline code
        .replace(
          /`([^`]+)`/g,
          '<code class="bg-gray-700 text-cyan-300 px-2 py-1 rounded text-sm font-mono">$1</code>'
        )

        // Lists
        .replace(/^- (.*$)/gm, '<li class="text-gray-200 ml-4 mb-2">• $1</li>')
        .replace(
          /^(\d+)\. (.*$)/gm,
          '<li class="text-gray-200 ml-4 mb-2">$1. $2</li>'
        )

        // Line breaks
        .replace(/\n/g, "<br/>")
    );
  };

  const truncateCode = (code, maxLines = 10) => {
    const lines = code.split("\n");
    if (lines.length <= maxLines) return code;
    return lines.slice(0, maxLines).join("\n") + "\n...";
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const displayCode = isCodeExpanded ? item.code : truncateCode(item.code, 15);
  const codeLines = (item.code || "").split("\n");
  const shouldShowExpandButton = codeLines.length > 15;

  // Get language-specific file extension
  const getFileExtension = (language) => {
    const extensions = {
      javascript: "js",
      python: "py",
      java: "java",
      cpp: "cpp",
      typescript: "ts",
      html: "html",
      css: "css",
      json: "json",
    };
    return extensions[language?.toLowerCase()] || "txt";
  };

  return (
    <div className="py-6 px-2 bg-gray-800 rounded-lg border border-gray-700 shadow-md w-full max-w-[300px] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[1200px] ">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          <p className="text-sm text-gray-400">
            Language:{" "}
            <span className="font-medium text-gray-300 capitalize">
              {item.language || "Unknown"}
            </span>
          </p>
          <span className="text-gray-600">•</span>
          <span className="text-xs text-gray-500">
            {codeLines.length} lines
          </span>
        </div>
        {item.createdAt && (
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            {formatTimestamp(item.createdAt)}
          </p>
        )}
      </div>

      {/* Code Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-300 flex items-center gap-2">
            <Code className="w-4 h-4 text-blue-400" />
            Submitted Code
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(item.code, "code")}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200 rounded-md"
              title="Copy code"
            >
              {copiedCode ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            {shouldShowExpandButton && (
              <button
                onClick={() => setIsCodeExpanded(!isCodeExpanded)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200 rounded-md"
                title={isCodeExpanded ? "Collapse code" : "Expand code"}
              >
                {isCodeExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-inner">
          {/* Code header */}
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-xs text-gray-400 ml-2">
                code.{getFileExtension(item.language)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {isCodeExpanded
                ? codeLines.length
                : Math.min(15, codeLines.length)}{" "}
              lines
            </div>
          </div>

          {/* Code content with line numbers */}
          <div className="flex">
            {/* Line numbers */}
            <div className="bg-gray-850 px-3 py-4 text-xs text-gray-600 font-mono select-none border-r border-gray-700 min-w-12">
              {displayCode.split("\n").map((_, index) => (
                <div key={index} className="h-5 leading-5 text-right">
                  {index + 1}
                </div>
              ))}
            </div>

            {/* Code */}
            <div className="flex-1 overflow-auto">
              <pre className="p-4 overflow-x-auto text-sm leading-5">
                <code className="text-gray-100 font-mono whitespace-pre">
                  {displayCode}
                </code>
              </pre>
            </div>
          </div>

          {!isCodeExpanded && shouldShowExpandButton && (
            <div className="bg-gradient-to-t from-gray-900 to-transparent h-8 flex items-end justify-center pb-2">
              <span className="text-xs text-gray-500">
                {codeLines.length - 15} more lines...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Review Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            AI Review
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(item.reviewResult, "review")}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200 rounded-md"
              title="Copy review"
            >
              {copiedReview ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setIsReviewExpanded(!isReviewExpanded)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200 rounded-md"
              title={isReviewExpanded ? "Collapse review" : "Expand review"}
            >
              {isReviewExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        {isReviewExpanded && (
          <div
            className="bg-gray-900 p-4 rounded-lg border border-gray-700 text-gray-100 ai-response"
            dangerouslySetInnerHTML={{
              __html: formatAIResponse(item.reviewResult),
            }}
          />
        )}
      </div>
    </div>
  );
}
