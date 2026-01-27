'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { api, Post } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const router = useRouter();

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
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUserId(userData.data?.id || null);
        }
      } catch (err) {
        console.error('User fetch error:', err);
      }
      
      loadPosts();
    });

    return () => unsubscribe();
  }, [router]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await api.getPosts(1);
      setPosts(response.data || []);
    } catch (err: any) {
      setError(err.message || '投稿の読み込みに失敗しました');
      console.error('Load posts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim() || content.length > 120) {
      setError('投稿内容は1文字以上120文字以内で入力してください。');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const newPost = await api.createPost(content);
      setContent('');
      await loadPosts();
    } catch (err: any) {
      setError(err.message || '投稿の作成に失敗しました');
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
      await loadPosts();
    } catch (err: any) {
      setError(err.message || '投稿の削除に失敗しました');
    }
  };

  const handleLike = async (postId: number) => {
    try {
      await api.toggleLike(postId);
      await loadPosts();
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={120}
              placeholder="何をシェアしますか？"
              className="w-full px-4 py-2 border border-white rounded-md bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={4}
            />
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-md shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '投稿中...' : 'シェアする'}
            </button>
          </form>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 p-8">
        <h2 className="text-white text-2xl font-bold mb-4">ホーム</h2>
        <div className="border-t border-gray-600 mb-6"></div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-white">読み込み中...</div>
        ) : posts.length === 0 ? (
          <div className="text-white">投稿がありません</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-[#34495E] border border-white rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold">{post.user_name}</span>
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1 text-pink-500 hover:opacity-80"
                    >
                      <Image src="/assets/heart.png" alt="いいね" width={20} height={20} />
                      <span className="text-white">{post.likes_count}</span>
                    </button>
                    {currentUserId === post.user_id && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-white hover:opacity-80"
                      >
                        <Image src="/assets/cross.png" alt="削除" width={20} height={20} />
                      </button>
                    )}
                    <Link
                      href={`/posts/${post.id}/comments`}
                      className="text-white hover:opacity-80"
                    >
                      <Image src="/assets/detail.png" alt="詳細" width={20} height={20} />
                    </Link>
                  </div>
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
