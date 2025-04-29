import "../../src/index.css"; // Import your CSS file here
import React, { useEffect, useState, useRef } from "react";

import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-css";
import "prismjs/components/prism-jsx";

export default function ReviewResult({ reviewedResult, loading, language }) {
  const [displayedResult, setDisplayedResult] = useState("");
  const [streamingComplete, setStreamingComplete] = useState(false);
  const reviewContainerRef = useRef(null);

  useEffect(() => {
    if (reviewedResult && !streamingComplete) {
      setDisplayedResult("");
      setStreamingComplete(false);
      let i = 0;
      const resultLength = reviewedResult.length;
      const streamingSpeed = Math.max(
        10,
        Math.min(30, Math.floor(resultLength / 100))
      );

      const streamText = () => {
        if (i < resultLength) {
          setDisplayedResult(reviewedResult.substring(0, i + 1));
          i++;
          setTimeout(streamText, streamingSpeed);
        } else {
          setStreamingComplete(true);
        }
      };

      streamText();
    }
  }, [reviewedResult]);

  // This effect runs when the component mounts or when the displayedResult or reviewedResult changes
  useEffect(() => {
    Prism.highlightAll();

    // Scroll to the bottom of the review container
    if (reviewContainerRef.current) {
      reviewContainerRef.current.scrollTop =
        reviewContainerRef.current.scrollHeight;
    }

    // Copy button logic
    const copyButtons = document.querySelectorAll(".copy-btn");
    copyButtons.forEach((btn) => {
      btn.onclick = () => {
        const code = btn.getAttribute("data-code");
        navigator.clipboard.writeText(
          code
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
        );
        btn.innerText = "Copied!";
        setTimeout(() => (btn.innerText = "Copy"), 2000);
      };
    });

    // Highlight the improved code once streaming is complete
    if (streamingComplete) {
      const improvedCodeBlock = document.querySelector(".improved-code");
      if (improvedCodeBlock) {
        Prism.highlightElement(improvedCodeBlock);
      }
    }
  }, [displayedResult, reviewedResult, streamingComplete]);

  // Format the AI response to HTML
  const formatAIResponse = (text) => {
    if (!text) return text;

    return (
      text
        // Headers
        .replace(/^# (.*$)/gm, '<h3 class="text-xl font-bold my-3">$1</h3>')
        .replace(
          /^## (.*$)/gm,
          '<h4 class="text-lg font-semibold my-2">$1</h4>'
        )
        .replace(/^### (.*$)/gm, '<h5 class="font-medium my-2">$1</h5>')

        // Bold and Italic
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

        // Lists
        .replace(/^\s*-\s(.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
        .replace(/^\s*\*\s(.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
        .replace(/^\s*\d+\.\s(.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')

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
          {reviewedResult && (
            <div
              className="text-gray-100 ai-response"
              dangerouslySetInnerHTML={{
                __html: formatAIResponse(displayedResult),
              }}
            />
          )}
        </div>
      ) : reviewedResult ? (
        <>
          <div
            className="text-gray-100 ai-response"
            dangerouslySetInnerHTML={{
              __html: formatAIResponse(displayedResult),
            }}
          />
          {!streamingComplete && (
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
