import "../../src/index.css"; // Import your CSS file here
import React, { useEffect, useState, useRef } from "react";

import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-css";
import "prismjs/components/prism-jsx";

export default function ReviewResult({
  reviewedResult,
  loading,
  language,
  hasCodeInput,
  isNewSubmission,
}) {
  const [displayedResult, setDisplayedResult] = useState("");
  const [streamingComplete, setStreamingComplete] = useState(true);
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

    // Clear existing timeout
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
      10,
      Math.min(30, Math.floor(resultLength / 100))
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

  // Clear timeout when component unmounts
  useEffect(() => {
    return () => {
      if (streamingRef.current) {
        clearTimeout(streamingRef.current);
      }
    };
  }, []);

  // Highlight and scroll effects
  useEffect(() => {
    Prism.highlightAll();

    if (reviewContainerRef.current) {
      reviewContainerRef.current.scrollTop =
        reviewContainerRef.current.scrollHeight;
    }
  }, [displayedResult, streamingComplete]);

  useEffect(() => {
    const handleCopyClick = (e) => {
      const btn = e.target.closest(".copy-btn");
      if (btn) {
        const code = btn.getAttribute("data-code");
        navigator.clipboard
          .writeText(
            code
              .replace(/&quot;/g, '"')
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&amp;/g, "&")
              .replace(/&nbsp;/g, " ")
          )
          .then(() => {
            const originalText = btn.innerText;
            btn.innerText = "Copied!";
            setTimeout(() => {
              if (btn) btn.innerText = originalText;
            }, 2000);
            toast.success("Code copied to clipboard!");
          })
          .catch((err) => {
            toast.error("Failed to copy code");
          });
      }
    };
    const container = reviewContainerRef.current;
    if (container) {
      container?.addEventListener("click", handleCopyClick);
    }
    return () => {
      if (container) {
        container.removeEventListener("click", handleCopyClick);
      }
    };
  }, []);

  // Format the AI response to HTML
  const formatAIResponse = (text) => {
    if (!text) return text;

    return (
      text
        .replace(/^# (.*$)/gm, '<h3 class="text-xl font-bold my-3">$1</h3>')
        .replace(
          /^## (.*$)/gm,
          '<h4 class="text-lg font-semibold my-2">$1</h4>'
        )
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
        .replace(/^\s*---\s*$/gm, '<hr class="my-4 border-gray-600"/>')

        // Code blocks
        .replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
          const language = lang || "javascript";
          const highlighted = Prism.highlight(
            code,
            Prism.languages[language],
            language
          );
          const escapedCode = code
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

          return `
            <div class="relative group improved-code">
              <button 
                class="absolute top-2 right-2 hidden group-hover:block bg-gray-700 text-white px-2 py-1 rounded text-xs copy-btn"
                data-code="${escapedCode}">
                Copy
              </button>
              <pre class="language-${language} bg-gray-800 rounded-lg p-4 my-4 overflow-x-auto text-sm">
                <code>${highlighted}</code>
              </pre>
            </div>
          `;
        })

        // Inline code
        .replace(
          /`(.*?)`/g,
          '<code class="bg-gray-700 px-1 py-0.5 rounded text-sm">$1</code>'
        )

        // Paragraphs and line breaks
        .replace(/([^\n])\n([^\n])/g, "$1<br/>$2")
        .replace(/^\s*([^\n<].*$)/gm, '<p class="my-2">$1</p>')

        // Horizontal rule
        .replace(/^\s*---\s*$/gm, '<hr class="my-4 border-gray-600"/>')
    );
  };

  return (
    <div
      ref={reviewContainerRef}
      id="review-result"
      className="mt-6 p-6 bg-gray-900 rounded-lg overflow-auto min-h-[300px] max-h-[600px] scroll-smooth"
    >
      <h2 className="text-2xl font-bold mb-4 text-white">AI Review Result</h2>
      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-green-400">
            <span className="animate-pulse">⏳</span>
            <span className="text-lg">Generating review...</span>
          </div>
        </div>
      ) : reviewedResult ? (
        <>
          <div
            className="text-gray-100 ai-response"
            dangerouslySetInnerHTML={{
              __html: formatAIResponse(displayedResult || reviewedResult),
            }}
          />
          {!streamingComplete &&
            displayedResult.length < reviewedResult.length && (
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="h-2 w-2 bg-green-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="h-2 w-2 bg-green-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="h-2 w-2 bg-green-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
                <span className="text-sm text-gray-400 ml-2">Streaming...</span>
              </div>
            )}
        </>
      ) : (
        <p className="text-gray-400 italic text-lg">
          Your code review will appear here...
        </p>
      )}
    </div>
  );
}
