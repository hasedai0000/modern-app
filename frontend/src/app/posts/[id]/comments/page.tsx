'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, useParams } from 'next/navigation';
import { api, Post, Comment } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default function CommentsPage() {
  const params = useParams();
  const postId = parseInt(params.id as string);
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      // ユーザー情報を取得してcurrentUserIdを設定
      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUserId(userData.data?.id || null);
        }
      } catch (err) {
        console.error('User fetch error:', err);
      }

      loadData();
    });

    return () => unsubscribe();
  }, [router, postId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postData, commentsData] = await Promise.all([
        api.getPost(postId),
        api.getComments(postId),
      ]);
      setPost(postData);
      setComments(commentsData);
    } catch (err: any) {
      setError(err.message || 'データの読み込みに失敗しました');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim() || content.length > 120) {
      setError('コメント内容は1文字以上120文字以内で入力してください。');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.createComment(postId, content);
      setContent('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'コメントの作成に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('この投稿を削除しますか？')) {
      return;
    }

    try {
      await api.deletePost(postId);
      router.push('/');
    } catch (err: any) {
      setError(err.message || '投稿の削除に失敗しました');
    }
  };

  const handleLike = async (postId: number) => {
    try {
      await api.toggleLike(postId);
      await loadData();
    } catch (err: any) {
      setError('いいねの処理に失敗しました');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleShareSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const shareContent = formData.get('content') as string;

    if (!shareContent.trim() || shareContent.length > 120) {
      setError('投稿内容は1文字以上120文字以内で入力してください。');
      return;
    }

    try {
      await api.createPost(shareContent);
      e.currentTarget.reset();
      router.push('/');
    } catch (err: any) {
      setError(err.message || '投稿の作成に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-[#2C3E50] flex">
      {/* 左サイドバー */}
      <aside className="w-64 bg-[#34495E] p-6 flex flex-col">
        <h1 className="text-white text-2xl font-bold mb-8">SHARE</h1>

        <nav className="mb-8">
          <Link href="/" className="flex items-center gap-3 text-white mb-4 hover:opacity-80">
            <Image src="/assets/home.png" alt="ホーム" width={24} height={24} />
            <span>ホーム</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-white hover:opacity-80"
          >
            <Image src="/assets/logout.png" alt="ログアウト" width={24} height={24} />
            <span>ログアウト</span>
          </button>
        </nav>

        <div className="mt-auto">
          <h2 className="text-white text-lg font-semibold mb-4">シェア</h2>
          <form onSubmit={handleShareSubmit} className="space-y-4">
            <textarea
              name="content"
              maxLength={120}
              placeholder="何をシェアしますか？"
              className="w-full px-4 py-2 border border-white rounded-md bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={4}
            />
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-md shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
            >
              シェアする
            </button>
          </form>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 p-8">
        <h2 className="text-white text-2xl font-bold mb-4">コメント</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-white">読み込み中...</div>
        ) : post ? (
          <>
            {/* 投稿表示 */}
            <div className="bg-white border border-white rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-black font-semibold">{post.user_name}</span>
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1 text-pink-500 hover:opacity-80"
                  >
                    <Image src="/assets/heart.png" alt="いいね" width={20} height={20} />
                    <span className="text-black">{post.likes_count}</span>
                  </button>
                  {currentUserId === post.user_id && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-black hover:opacity-80"
                    >
                      <Image src="/assets/cross.png" alt="削除" width={20} height={20} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-black">{post.content}</p>
            </div>

            {/* コメントセクション */}
            <div className="border-t border-gray-600 mb-6"></div>
            <h3 className="text-white text-xl font-semibold mb-4">コメント</h3>

            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex gap-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={120}
                  placeholder="コメントを入力"
                  className="flex-1 px-4 py-2 border border-white rounded-md bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={4}
                />
                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-md shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed self-start"
                >
                  {submitting ? '投稿中...' : 'コメント'}
                </button>
              </div>
            </form>

            {/* コメント一覧 */}
            {comments.length === 0 ? (
              <div className="text-white">コメントがありません</div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-[#34495E] border border-white rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-white font-semibold">{comment.user_name}</span>
                    </div>
                    <p className="text-white">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-white">投稿が見つかりません</div>
        )}
      </main>
    </div>
  );
}

