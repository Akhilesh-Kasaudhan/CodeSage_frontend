import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Code } from "lucide-react";

export default function CodeInput({
  value,
  onChange,
  placeholder = "Paste your code here...",
  language = "javascript",
  showLineNumbers = true,
  readOnly = false,
  showStats = true,
}) {
  const textareaRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Calculate stats
  const lines = (value || "").split("\n").length;
  const characters = (value || "").length;
  const words = (value || "").trim().split(/\s+/).filter(Boolean).length;

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";

      const lineHeight = 24; // Approximate line height
      const newHeight = Math.max(6, lines) * lineHeight;

      textarea.style.height = `${newHeight}px`;
    }
  }, [value, lines]);

  const handleChange = (event) => {
    const newValue = event.target.value;
    onChange(newValue);
  };

  const handleKeyDown = (event) => {
    // Handle tab indentation
    if (event.key === "Tab") {
      event.preventDefault();
      const start = event.target.selectionStart;
      const end = event.target.selectionEnd;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);

      // Set cursor position after tab
      setTimeout(() => {
        event.target.selectionStart = event.target.selectionEnd = start + 2;
      }, 0);
    }

    // Handle auto-closing brackets
    const pairs = {
      "(": ")",
      "[": "]",
      "{": "}",
      '"': '"',
      "'": "'",
    };

    if (pairs[event.key]) {
      const start = event.target.selectionStart;
      const end = event.target.selectionEnd;

      if (start === end) {
        // No selection
        event.preventDefault();
        const newValue =
          value.substring(0, start) +
          event.key +
          pairs[event.key] +
          value.substring(end);
        onChange(newValue);

        setTimeout(() => {
          event.target.selectionStart = event.target.selectionEnd = start + 1;
        }, 0);
      }
    }
  };

  const handleCopy = async () => {
    if (value) {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  const handlePaste = (event) => {
    // Custom paste handling for better formatting
    event.preventDefault();
    const pastedText = event.clipboardData.getData("text");
    const start = event.target.selectionStart;
    const end = event.target.selectionEnd;
    const newValue =
      value.substring(0, start) + pastedText + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      event.target.selectionStart = event.target.selectionEnd =
        start + pastedText.length;
    }, 0);
  };

  const formatCode = () => {
    if (!value) return;

    try {
      // Basic formatting for JSON
      if (language === "json") {
        const formatted = JSON.stringify(JSON.parse(value), null, 2);
        onChange(formatted);
      }
      // Add more formatters as needed
    } catch (err) {
      console.error("Formatting failed:", err);
    }
  };

  const clearCode = () => {
    onChange("");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Code className="w-4 h-4" />

          {showLineNumbers && (
            <span className="text-gray-400">• {lines} lines</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {value && (
            <>
              {language === "json" && (
                <button
                  onClick={formatCode}
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  title="Format JSON"
                >
                  Format
                </button>
              )}

              <button
                onClick={handleCopy}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="Copy code"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={clearCode}
                className="px-2 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors"
                title="Clear code"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main input area */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value || ""}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`
            font-mono text-sm resize-none transition-all duration-200
            ${showLineNumbers ? "pl-12" : "pl-4"}
            ${readOnly ? "bg-gray-50 cursor-not-allowed" : ""}
          `}
          style={{
            minHeight: "144px",
            lineHeight: "24px",
            tabSize: 2,
          }}
        />

        {/* Line numbers */}
        {showLineNumbers && value && (
          <div className="absolute left-0 top-0 pt-3 pb-3 px-2 text-xs text-gray-400 font-mono pointer-events-none select-none">
            {Array.from({ length: lines }, (_, i) => (
              <div key={i} style={{ height: "24px", lineHeight: "24px" }}>
                {i + 1}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      {showStats && value && (
        <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded">
          <span>{lines} lines</span>
          <span>{words} words</span>
          <span>{characters} characters</span>
          {!readOnly && <span className="text-gray-400">• Tab for indent</span>}
        </div>
      )}
    </div>
  );
}
