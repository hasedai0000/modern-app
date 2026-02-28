"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { validatePost, hasValidationErrors } from "@/lib/validations/post";

interface SidebarProps {
  onLogout: () => void;
  onShareSubmit: (content: string) => Promise<void>;
}

export default function Sidebar({ onLogout, onShareSubmit }: SidebarProps) {
  const [content, setContent] = useState("");
  const [shareError, setShareError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validation_errors = validatePost(content);
    if (hasValidationErrors(validation_errors)) {
      setShareError(validation_errors.content || "");
      return;
    }

    setSubmitting(true);
    setShareError("");

    try {
      await onShareSubmit(content.trim());
      setContent("");
    } catch (err) {
      setShareError(
        err instanceof Error ? err.message : "投稿の作成に失敗しました",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="w-1/5 p-3 py-6 flex flex-col">
      <div className="mb-8">
        <Image src="/assets/logo.png" alt="SHARE" width={120} height={40} />
      </div>

      <nav className="mb-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-white mb-4 hover:opacity-80"
        >
          <Image src="/assets/home.png" alt="ホーム" width={24} height={24} />
          <span>ホーム</span>
        </Link>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 text-white hover:opacity-80"
        >
          <Image
            src="/assets/logout.png"
            alt="ログアウト"
            width={24}
            height={24}
          />
          <span>ログアウト</span>
        </button>
      </nav>

      <div>
        <h2 className="flex items-center gap-2 text-white text-lg font-semibold mb-4">
          <Image
            src="/assets/feather.png"
            alt="シェア"
            width={20}
            height={20}
          />
          シェア
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (shareError) setShareError("");
            }}
            placeholder="何をシェアしますか？"
            className="w-full px-4 py-2 border border-white rounded-md bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={6}
          />
          <div className="flex justify-between items-center">
            <span
              className={`text-xs ${content.length > 120 ? "text-red-400" : "text-gray-400"}`}
            >
              {content.length}/120
            </span>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-full border-4 border-t-gray-500 border-l-gray-500 border-r-gray-900 border-b-gray-900 shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "投稿中..." : "シェアする"}
            </button>
          </div>
          {shareError && (
            <p className="text-red-400 text-xs mt-1">{shareError}</p>
          )}
        </form>
      </div>
    </aside>
  );
}
