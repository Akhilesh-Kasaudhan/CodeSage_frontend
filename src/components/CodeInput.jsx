import React from "react";
import { Textarea } from "@/components/ui/textarea";

export default function CodeInput({ value, onChange }) {
  const handleChange = (event) => {
    onChange(event.target.value); // Extract the value here
  };
  return (
    <Textarea
      value={value || ""}
      className="min-h-[150px]"
      placeholder="Paste your code here..."
      onChange={handleChange}
    />
  );
}
