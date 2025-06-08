import "../../src/index.css";
import React, { useEffect, useState, useRef } from "react";
import { Copy, Check, Eye, Code, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-css";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-php";

export default function ReviewResult({
  reviewedResult,
  loading,
  language,
  hasCodeInput,
  isNewSubmission,
}) {
  const [displayedResult, setDisplayedResult] = useState("");
  const [streamingComplete, setStreamingComplete] = useState(true);
  const [copiedStates, setCopiedStates] = useState({});
  const reviewContainerRef = useRef(null);
  const streamingRef = useRef(null);
  const [lastReviewedResult, setLastReviewedResult] = useState(null);

  useEffect(() => {
    if (!hasCodeInput || !reviewedResult) {
      setDisplayedResult("");
      setStreamingComplete(true);
      setLastReviewedResult(null);
      return;
    }
    if (reviewedResult === lastReviewedResult) return;

    if (streamingRef.current) {
      clearTimeout(streamingRef.current);
      streamingRef.current = null;
    }

    setDisplayedResult("");
    setStreamingComplete(false);
    setLastReviewedResult(reviewedResult);

    let i = 0;
    const resultLength = reviewedResult.length;
    const streamingSpeed = Math.max(
      5,
      Math.min(20, Math.floor(resultLength / 150))
    );
    const streamText = () => {
      if (i < resultLength) {
        setDisplayedResult((prev) => prev + reviewedResult[i]);
        i++;
        streamingRef.current = setTimeout(streamText, streamingSpeed);
      } else {
        setStreamingComplete(true);
        streamingRef.current = null;
      }
    };

    streamText();

    return () => {
      if (streamingRef.current) {
        clearTimeout(streamingRef.current);
      }
    };
  }, [reviewedResult, hasCodeInput]);

  useEffect(() => {
    return () => {
      if (streamingRef.current) {
        clearTimeout(streamingRef.current);
      }
    };
  }, []);

  useEffect(() => {
    Prism.highlightAll();
    if (reviewContainerRef.current && !streamingComplete) {
      reviewContainerRef.current.scrollTop =
        reviewContainerRef.current.scrollHeight;
    }
  }, [displayedResult, streamingComplete]);

  const handleCopy = async (code, index) => {
    try {
      const cleanCode = code
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&nbsp;/g, " ");

      await navigator.clipboard.writeText(cleanCode);

      setCopiedStates((prev) => ({ ...prev, [index]: true }));
      toast.success("Code copied to clipboard!");

      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [index]: false }));
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  const formatAIResponse = (text) => {
    if (!text) return text;

    let codeBlockIndex = 0;

    return (
      text
        // Clean up extra whitespace first
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

        // Enhanced code blocks with copy button
        .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
          const language = lang || "javascript";
          const trimmedCode = code.trim();
          const highlighted = Prism.highlight(
            trimmedCode,
            Prism.languages[language] || Prism.languages.javascript,
            language
          );

          const escapedCode = trimmedCode
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

          const currentIndex = codeBlockIndex++;

          return `
          <div class="relative group my-6 rounded-xl overflow-hidden border border-gray-700/50 shadow-lg">
            <div class="flex items-center justify-between bg-gray-800/80 px-4 py-2 border-b border-gray-700/50">
              <span class="text-xs font-medium text-gray-300 flex items-center gap-2">
                <Code class="w-3 h-3" />
                ${language.toUpperCase()}
              </span>
              <button 
                onclick="handleCopyClick('${escapedCode}', ${currentIndex})"
                class="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors duration-200 copy-btn"
                data-code="${escapedCode}"
                data-index="${currentIndex}">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                <span class="copy-text">Copy</span>
              </button>
            </div>
            <pre class="language-${language} bg-gray-900 text-sm p-4 overflow-x-auto"><code class="language-${language}">${highlighted}</code></pre>
          </div>
        `;
        })

        // Inline code with better styling
        .replace(
          /`([^`\n]+?)`/g,
          '<code class="bg-gray-700/80 text-green-300 px-2 py-1 rounded-md text-sm font-mono border border-gray-600/50">$1</code>'
        )

        // Bold and italic with colors
        .replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="font-bold text-yellow-300">$1</strong>'
        )
        .replace(/\*(.*?)\*/g, '<em class="italic text-blue-300">$1</em>')

        // Enhanced lists
        .replace(
          /^\s*[-*+] (.*$)/gm,
          '<li class="flex items-start gap-2 my-1"><span class="text-blue-400 mt-1">•</span><span>$1</span></li>'
        )
        .replace(
          /^\s*(\d+)\. (.*$)/gm,
          '<li class="flex items-start gap-2 my-1"><span class="text-purple-400 font-semibold min-w-[20px]">$1.</span><span>$2</span></li>'
        )

        // Wrap consecutive list items
        .replace(
          /(<li class="flex[^>]*>.*?<\/li>\s*)+/gs,
          '<ul class="my-4 space-y-1 pl-2">$&</ul>'
        )

        // Horizontal rules
        .replace(
          /^\s*---\s*$/gm,
          '<hr class="my-6 border-gray-600/50 border-dashed"/>'
        )

        // Paragraphs with better spacing
        .replace(
          /^(?!<[h|u|o|l|p|d|hr])[^\n<]+$/gm,
          '<p class="my-3 text-gray-100 leading-relaxed">$&</p>'
        )

        // Clean up any double-wrapped paragraphs
        .replace(
          /<p[^>]*><p[^>]*>(.*?)<\/p><\/p>/g,
          '<p class="my-3 text-gray-100 leading-relaxed">$1</p>'
        )
    );
  };
  useEffect(() => {
    const handleCopyClick = (e) => {
      const btn = e.target.closest(".copy-btn");
      if (btn) {
        e.preventDefault();
        const code = btn.getAttribute("data-code");
        const index = btn.getAttribute("data-index");
        handleCopy(code, index);
      }
    };

    // Make copy function globally available
    window.handleCopyClick = (code, index) => {
      handleCopy(code, index);
    };

    const container = reviewContainerRef.current;
    if (container) {
      container.addEventListener("click", handleCopyClick);
    }

    return () => {
      if (container) {
        container.removeEventListener("click", handleCopyClick);
      }
    };
  }, []);

  if (!hasCodeInput) {
    return (
      <div className="w-full mt-6 p-8 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 min-h-[300px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Eye className="w-16 h-16 text-gray-600 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-400">
            Ready for Review
          </h3>
          <p className="text-gray-500 max-w-md">
            Enter your code in the editor and click "Review Code" to get
            intelligent feedback and suggestions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full   mt-6 p-4">
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-gray-800/50 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">AI Code Review</h2>
          </div>
          {reviewedResult && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Review Complete
            </div>
          )}
        </div>

        <div
          ref={reviewContainerRef}
          className="p-6 overflow-auto min-h-[300px] max-h-[600px] scroll-smooth custom-scrollbar"
        >
          {loading ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-blue-400">
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
                <span className="text-lg font-medium">
                  Analyzing your code...
                </span>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div
                      className="h-4 bg-gray-700/50 rounded-lg mb-2"
                      style={{ width: `${Math.random() * 40 + 60}%` }}
                    ></div>
                    <div
                      className="h-3 bg-gray-800/50 rounded mb-1"
                      style={{ width: `${Math.random() * 30 + 70}%` }}
                    ></div>
                    <div
                      className="h-3 bg-gray-800/50 rounded"
                      style={{ width: `${Math.random() * 50 + 50}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          ) : reviewedResult ? (
            <>
              <div
                className="text-gray-100 ai-response prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: formatAIResponse(displayedResult || reviewedResult),
                }}
              />
              {!streamingComplete &&
                displayedResult.length < reviewedResult.length && (
                  <div className="flex items-center gap-3 mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <div className="flex space-x-1">
                      <div
                        className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                    <span className="text-sm text-blue-300 font-medium">
                      Generating review...
                    </span>
                  </div>
                )}
            </>
          ) : (
            <div className="text-center py-12 space-y-4">
              <AlertCircle className="w-12 h-12 text-gray-600 mx-auto" />
              <h3 className="text-lg font-medium text-gray-400">
                No Review Yet
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Your detailed code review will appear here once the analysis is
                complete.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
