import React from "react";

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="loader mb-4">
        <div className="w-16 h-16 border-4 border-t-transparent border-green-400 rounded-full animate-spin"></div>
      </div>
      <p className="text-lg font-medium tracking-wide">
        Loading, please wait...
      </p>
    </div>
  );
}
