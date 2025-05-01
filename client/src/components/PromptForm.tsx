import { useState } from "react";

export default function PromptForm({ onSubmit }: { onSubmit: (prompt: string) => void }) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-md">
      <textarea
        className="w-full h-32 p-4 rounded-lg bg-black/30 text-white placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder='Describe your Mirrorverse self… e.g., "Me if I lived in 1920s Tokyo"'
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      ></textarea>
      <button
        type="submit"
        className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition duration-200"
      >
        Reflect
      </button>
    </form>
  );
}
