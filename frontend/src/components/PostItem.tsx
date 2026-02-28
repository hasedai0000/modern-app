import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/types/post";

interface PostItemProps {
  post: Post;
  currentUserId: number | null;
  onLike: (postId: number) => void;
  onDelete: (postId: number) => void;
  showDetailLink?: boolean;
}

export default function PostItem({
  post,
  currentUserId,
  onLike,
  onDelete,
  showDetailLink = false,
}: PostItemProps) {
  return (
    <div className="px-6 py-4 border-b border-l border-white-600">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-white font-semibold">{post.user_name}</span>
        <button
          onClick={() => onLike(post.id)}
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
          <button onClick={() => onDelete(post.id)} className="hover:opacity-80">
            <Image
              src="/assets/cross.png"
              alt="削除"
              width={20}
              height={20}
            />
          </button>
        )}
        {showDetailLink && (
          <Link href={`/posts/${post.id}/comments`} className="hover:opacity-80">
            <Image
              src="/assets/detail.png"
              alt="詳細"
              width={20}
              height={20}
            />
          </Link>
        )}
      </div>
      <p className="text-white">{post.content}</p>
    </div>
  );
}
