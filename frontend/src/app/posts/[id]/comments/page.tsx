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
import { validateComment, hasValidationErrors } from "@/lib/validations/comment";
import type { Post, Comment } from "@/types/post";
import Sidebar from "@/components/Sidebar";
import PostItem from "@/components/PostItem";

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
  const [commentError, setCommentError] = useState("");
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

    const validation_errors = validateComment(content);
    if (hasValidationErrors(validation_errors)) {
      setCommentError(validation_errors.content || '');
      return;
    }

    if (!auth?.currentUser) return;

    setSubmitting(true);
    setCommentError("");
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

  const handleShareSubmit = async (shareContent: string) => {
    if (!auth?.currentUser) return;

    const token = await auth.currentUser.getIdToken();
    const res = await createPost({ content: shareContent }, token);
    if (!res.data) {
      throw new Error(res.errorMessage || "投稿の作成に失敗しました");
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#2C3E50] flex">
      {/* 左サイドバー */}
      <Sidebar onLogout={handleLogout} onShareSubmit={handleShareSubmit} />

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
            <PostItem
              post={post}
              currentUserId={currentUserId}
              onLike={handleLike}
              onDelete={handleDelete}
            />

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
              {commentError && (
                <p className="text-red-400 text-xs mb-2">{commentError}</p>
              )}
              <div className="flex gap-3 items-center">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      if (commentError) setCommentError("");
                    }}
                    placeholder=""
                    className="w-full px-4 py-2 border border-white rounded-md bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className={`absolute right-2 bottom-2 text-xs ${content.length > 120 ? "text-red-400" : "text-gray-400"}`}>
                    {content.length}/120
                  </span>
                </div>
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
