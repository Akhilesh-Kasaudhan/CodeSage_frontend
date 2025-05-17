import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-6 py-10 space-y-16">
      {/* Hero Section */}
      <section className="text-center max-w-4xl space-y-6">
        <h1 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          CodeSage AI
        </h1>
        <p className="text-xl text-gray-300">
          Your smart coding assistant — Write, review, and optimize code with
          the power of AI.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => navigate("/auth")}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl text-white font-semibold"
          >
            Try Now
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl grid md:grid-cols-3 gap-8">
        {[
          {
            title: "AI Code Review",
            desc: "Instant, intelligent feedback on your code to help you improve quality.",
          },
          {
            title: "Autocompletion",
            desc: "Suggests complete lines and functions based on your code context.",
          },
          {
            title: "Multi-language Support",
            desc: "Works with JavaScript, Python, TypeScript, C++, and more.",
          },
        ].map(({ title, desc }, i) => (
          <div
            key={i}
            className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-cyan-500/30 transition"
          >
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-400">{desc}</p>
          </div>
        ))}
      </section>

      {/* Testimonials */}
      <section className="max-w-4xl space-y-6 text-center">
        <h2 className="text-3xl font-bold">Loved by Developers</h2>
        <blockquote className="text-gray-400 italic">
          “CodeSage AI helped me ship code 3x faster with fewer bugs. It’s like
          having a senior dev pair-programming with you 24/7.”
        </blockquote>
        <p className="text-gray-500">— Jane Doe, Full Stack Engineer</p>
      </section>

      {/* Footer */}
      <footer className="pt-10 border-t border-gray-700 w-full text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} CodeSage AI. All rights reserved.
      </footer>
    </main>
  );
};

export default Home;
