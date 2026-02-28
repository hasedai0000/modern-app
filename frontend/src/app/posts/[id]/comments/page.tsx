"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter, useParams } from "next/navigation";
import { verifyUserAfterLogin } from "@/app/actions/authApi";
import {
  getPost,
  getComments,
  createComment,
  createPost,
  deletePost,
  toggleLike,
} from "@/app/actions/postApi";
import type { Post, Comment } from "@/types/post";
import Image from "next/image";
import Link from "next/link";

export default function CommentsPage() {
  const params = useParams();
  const postId = parseInt(params.id as string);
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

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

      try {
        const token = await user.getIdToken();
        const res = await verifyUserAfterLogin(token);
        setCurrentUserId(res.data?.id ?? null);
      } catch (err) {
        console.error("User fetch error:", err);
      }

      loadData();
    });

    return () => unsubscribe();
  }, [router, postId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postRes, commentsRes] = await Promise.all([
        getPost(postId),
        getComments(postId),
      ]);
      setPost(postRes.data ?? null);
      setComments(commentsRes.data ?? []);
      if (postRes.errorMessage) {
        setError(postRes.errorMessage);
      } else if (commentsRes.errorMessage) {
        setError(commentsRes.errorMessage);
      } else {
        setError("");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "データの読み込みに失敗しました",
      );
      console.error("Load data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim() || content.length > 120) {
      setError("コメント内容は1文字以上120文字以内で入力してください。");
      return;
    }
    if (!auth?.currentUser) return;

    setSubmitting(true);
    setError("");

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await createComment(
        postId,
        { content: content.trim() },
        token,
      );
      if (res.data) {
        setContent("");
        await loadData();
      } else {
        setError(res.errorMessage || "コメントの作成に失敗しました");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "コメントの作成に失敗しました",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (targetPostId: number) => {
    if (!confirm("この投稿を削除しますか？")) return;
    if (!auth?.currentUser) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await deletePost(targetPostId, token);
      if (res.data !== undefined) {
        router.push("/");
      } else {
        setError(res.errorMessage || "投稿の削除に失敗しました");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "投稿の削除に失敗しました");
    }
  };

  const handleLike = async (targetPostId: number) => {
    if (!auth?.currentUser) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await toggleLike(targetPostId, token);
      if (res.data) {
        await loadData();
      } else {
        setError(res.errorMessage || "いいねの処理に失敗しました");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "いいねの処理に失敗しました",
      );
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

  const handleShareSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const shareContent = (formData.get("content") as string)?.trim();

    if (!shareContent || shareContent.length > 120) {
      setError("投稿内容は1文字以上120文字以内で入力してください。");
      return;
    }
    if (!auth?.currentUser) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await createPost({ content: shareContent }, token);
      if (res.data) {
        form.reset();
        router.push("/");
      } else {
        setError(res.errorMessage || "投稿の作成に失敗しました");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "投稿の作成に失敗しました");
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
          <form onSubmit={handleShareSubmit} className="space-y-4" suppressHydrationWarning>
            <textarea
              name="content"
              maxLength={120}
              placeholder="何をシェアしますか？"
              className="w-full px-4 py-2 border border-white rounded-md bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={6}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-full border-4 border-t-gray-500 border-l-gray-500 border-r-gray-900 border-b-gray-900 shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
              >
                シェアする
              </button>
            </div>
          </form>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col">
        <h2 className="text-white text-2xl font-bold px-6 py-4 border-b border-l border-white-600">
          コメント
        </h2>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-white p-6">読み込み中...</div>
        ) : post ? (
          <>
            {/* 投稿表示 */}
            <div className="px-6 py-4 border-b border-l border-white-600">
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
                  <span className="text-white text-sm">{post.likes_count}</span>
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
              </div>
              <p className="text-white">{post.content}</p>
            </div>

            {/* コメントセクション区切り */}
            <div className="px-6 py-3 border-b border-l border-white-600 text-center">
              <span className="text-white">コメント</span>
            </div>

            {/* コメント一覧 */}
            {comments.length === 0 ? (
              <div className="text-white px-6 py-4">コメントがありません</div>
            ) : (
              <div>
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="px-6 py-4 border-b border-l border-white-600"
                  >
                    <span className="text-white font-semibold block mb-1">
                      {comment.user_name}
                    </span>
                    <p className="text-white">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* コメント入力フォーム（最下部） */}
            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={120}
                  placeholder=""
                  className="flex-1 px-4 py-2 border border-white rounded-md bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-full border-4 border-t-gray-500 border-l-gray-500 border-r-gray-900 border-b-gray-900 shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {submitting ? "投稿中..." : "コメント"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-white p-6">投稿が見つかりません</div>
        )}
      </main>
    </div>
  );
}
