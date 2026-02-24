export type Post = {
  id: number;
  user_id: number;
  user_name: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_liked?: boolean;
};

export type Comment = {
  id: number;
  user_id: number;
  user_name: string;
  post_id: number;
  content: string;
  created_at: string;
};

export type CreatePostRequest = {
  content: string;
};

export type CreateCommentRequest = {
  content: string;
};

export type PostsResponse = {
  success: boolean;
  data: Post[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type PostResponse = {
  success: boolean;
  data: Post;
};

export type CommentsResponse = {
  success: boolean;
  data: Comment[];
};

export type CommentResponse = {
  success: boolean;
  data: Comment;
};

export type ToggleLikeResponse = {
  post_id: number;
  is_liked: boolean;
  likes_count: number;
};
