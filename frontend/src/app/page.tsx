"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  getPosts,
  createPost,
  deletePost,
  toggleLike,
} from "@/app/actions/postApi";
import type { Post } from "@/types/post";
import Sidebar from "@/components/Sidebar";
import PostItem from "@/components/PostItem";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

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

  const { current_user_id: currentUserId, handleLogout } = useAuth(loadPosts);

  const handleShareSubmit = async (shareContent: string) => {
    if (!auth?.currentUser) {
      router.push("/login");
      throw new Error("認証が必要です。再度ログインしてください。");
    }

    const token = await auth.currentUser.getIdToken();
    const res = await createPost({ content: shareContent }, token);
    if (!res.data) {
      throw new Error(res.errorMessage || "投稿の作成に失敗しました");
    }

    setSuccessMessage("投稿が完了しました！");
    await loadPosts();
    setTimeout(() => setSuccessMessage(""), 3000);
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

  return (
    <div className="min-h-screen bg-[#2C3E50] flex">
      {/* 左サイドバー */}
      <Sidebar onLogout={handleLogout} onShareSubmit={handleShareSubmit} />

      {/* トースト通知（固定表示） */}
      {(error || successMessage) && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
          {error && (
            <div className="px-5 py-3 bg-red-100 border border-red-400 text-red-700 rounded shadow-lg text-sm whitespace-nowrap">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="px-5 py-3 bg-green-100 border border-green-400 text-green-700 rounded shadow-lg text-sm whitespace-nowrap">
              {successMessage}
            </div>
          )}
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col">
        <h2 className="text-white text-2xl font-bold px-6 py-4 border-b border-l border-white-600">
          ホーム
        </h2>

        {loading ? (
          <div className="text-white px-6 py-4">読み込み中...</div>
        ) : posts.length === 0 ? (
          <div className="text-white px-6 py-4">投稿がありません</div>
        ) : (
          <div>
            {posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                onLike={handleLike}
                onDelete={handleDelete}
                showDetailLink
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
