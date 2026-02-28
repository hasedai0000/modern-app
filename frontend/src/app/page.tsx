"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { verifyUserAfterLogin } from "@/app/actions/authApi";
import {
  getPosts,
  createPost,
  deletePost,
  toggleLike,
} from "@/app/actions/postApi";
import type { Post } from "@/types/post";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      router.push("/login");
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      // ユーザー情報を取得してcurrentUserIdを設定
      try {
        const token = await user.getIdToken();
        const res = await verifyUserAfterLogin(token);
        setCurrentUserId(res.data?.id ?? null);
      } catch (err) {
        console.error("User fetch error:", err);
      }

      loadPosts();
    });

    return () => unsubscribe();
  }, [router]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const res = await getPosts(1);
      if (res.data) {
        setPosts(res.data);
      } else {
        setError(res.errorMessage || "投稿の読み込みに失敗しました");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "投稿の読み込みに失敗しました",
      );
      console.error("Load posts error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // フロントエンドでのバリデーション
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError("投稿内容を入力してください。");
      return;
    }

    if (trimmedContent.length > 120) {
      setError("投稿内容は120文字以内で入力してください。");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      if (!auth?.currentUser) {
        setError("認証が必要です。再度ログインしてください。");
        router.push("/login");
        return;
      }

      const token = await auth.currentUser.getIdToken();
      const res = await createPost({ content: trimmedContent }, token);
      if (res.data) {
        setContent("");
        setSuccessMessage("投稿が完了しました！");
        await loadPosts();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(res.errorMessage || "投稿の作成に失敗しました");
      }
    } catch (err: unknown) {
      console.error("投稿エラー:", err);
      setError(err instanceof Error ? err.message : "投稿の作成に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm("この投稿を削除しますか？")) {
      return;
    }
    if (!auth?.currentUser) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await deletePost(postId, token);
      if (res.data !== undefined) {
        await loadPosts();
      } else {
        setError(res.errorMessage || "投稿の削除に失敗しました");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "投稿の削除に失敗しました");
    }
  };

  const handleLike = async (postId: number) => {
    if (!auth?.currentUser) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await toggleLike(postId, token);
      if (res.data) {
        await loadPosts();
      } else {
        setError(res.errorMessage || "いいねの処理に失敗しました");
      }
    } catch (err: unknown) {
      setError("いいねの処理に失敗しました");
    }
  };

  const handleLogout = async () => {
    if (!auth) {
      router.push("/login");
      return;
    }

    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#2C3E50] flex">
      {/* 左サイドバー */}
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
            onClick={handleLogout}
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

        <div className="mt-auto">
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
                // エラーメッセージをクリア
                if (error) setError("");
              }}
              maxLength={120}
              placeholder="何をシェアしますか？"
              className="w-full px-4 py-2 border border-white rounded-md bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={6}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-full border-4 border-t-gray-500 border-l-gray-500 border-r-gray-900 border-b-gray-900 shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "投稿中..." : "シェアする"}
              </button>
            </div>
          </form>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col">
        <h2 className="text-white text-2xl font-bold px-6 py-4 border-b border-l border-white-600">
          ホーム
        </h2>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {loading ? (
          <div className="text-white px-6 py-4">読み込み中...</div>
        ) : posts.length === 0 ? (
          <div className="text-white px-6 py-4">投稿がありません</div>
        ) : (
          <div>
            {posts.map((post) => (
              <div
                key={post.id}
                className="px-6 py-4 border-b px-6 py-4 border-b border-l border-white-600 border-white-600"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-white font-semibold">
                    {post.user_name}
                  </span>
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1 hover:opacity-80"
                  >
                    <Image
                      src="/assets/heart.png"
                      alt="いいね"
                      width={20}
                      height={20}
                    />
                    <span className="text-white text-sm">
                      {post.likes_count}
                    </span>
                  </button>
                  {currentUserId === post.user_id && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="hover:opacity-80"
                    >
                      <Image
                        src="/assets/cross.png"
                        alt="削除"
                        width={20}
                        height={20}
                      />
                    </button>
                  )}
                  <Link
                    href={`/posts/${post.id}/comments`}
                    className="hover:opacity-80"
                  >
                    <Image
                      src="/assets/detail.png"
                      alt="詳細"
                      width={20}
                      height={20}
                    />
                  </Link>
                </div>
                <p className="text-white">{post.content}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
