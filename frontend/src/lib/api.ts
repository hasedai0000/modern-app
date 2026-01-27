import { auth } from "./firebase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const user = auth.currentUser;
  if (!user) return null;

  return await user.getIdToken();
}

async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
}

export interface Post {
  id: number;
  user_id: number;
  user_name: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_liked?: boolean;
}

export interface Comment {
  id: number;
  user_id: number;
  user_name: string;
  post_id: number;
  content: string;
  created_at: string;
}

export interface PostsResponse {
  success: boolean;
  data: Post[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface RegisterRequest {
  firebase_uid: string;
  user_name: string;
  email: string;
}

export interface RegisterResponse {
  id: number;
  firebase_uid: string;
  user_name: string;
  email: string;
  created_at: string;
}

export const api = {
  // 投稿一覧取得
  async getPosts(page: number = 1): Promise<PostsResponse> {
    const response = await fetchWithAuth(`/posts?page=${page}`);
    if (!response.ok) {
      throw new Error("投稿の取得に失敗しました");
    }
    const result: PostsResponse = await response.json();
    return result;
  },

  // 投稿作成
  async createPost(content: string): Promise<Post> {
    const response = await fetchWithAuth("/posts", {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      const error: ApiResponse<null> = await response.json();
      throw new Error(error.message || "投稿の作成に失敗しました");
    }
    const result: ApiResponse<Post> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.message || "投稿の作成に失敗しました");
    }
    return result.data;
  },

  // 投稿削除
  async deletePost(id: number): Promise<void> {
    const response = await fetchWithAuth(`/posts/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error: ApiResponse<null> = await response.json();
      throw new Error(error.message || "投稿の削除に失敗しました");
    }
  },

  // いいねトグル
  async toggleLike(
    postId: number
  ): Promise<{ post_id: number; is_liked: boolean; likes_count: number }> {
    const response = await fetchWithAuth(`/posts/${postId}/like`, {
      method: "POST",
    });
    if (!response.ok) {
      const error: ApiResponse<null> = await response.json();
      throw new Error(error.message || "いいねの処理に失敗しました");
    }
    const result: ApiResponse<{
      post_id: number;
      is_liked: boolean;
      likes_count: number;
    }> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.message || "いいねの処理に失敗しました");
    }
    return result.data;
  },

  // 投稿詳細取得
  async getPost(id: number): Promise<Post> {
    const response = await fetchWithAuth(`/posts/${id}`);
    if (!response.ok) {
      throw new Error("投稿の取得に失敗しました");
    }
    const result: ApiResponse<Post> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.message || "投稿の取得に失敗しました");
    }
    return result.data;
  },

  // コメント一覧取得
  async getComments(postId: number): Promise<Comment[]> {
    const response = await fetchWithAuth(`/posts/${postId}/comments`);
    if (!response.ok) {
      throw new Error("コメントの取得に失敗しました");
    }
    const result: ApiResponse<Comment[]> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.message || "コメントの取得に失敗しました");
    }
    return result.data;
  },

  // コメント作成
  async createComment(postId: number, content: string): Promise<Comment> {
    const response = await fetchWithAuth(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      const error: ApiResponse<null> = await response.json();
      throw new Error(error.message || "コメントの作成に失敗しました");
    }
    const result: ApiResponse<Comment> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.message || "コメントの作成に失敗しました");
    }
    return result.data;
  },

  // ユーザー登録
  async register(
    data: RegisterRequest,
    token: string
  ): Promise<RegisterResponse> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiResponse<null> = await response.json();
      // バリデーションエラーの場合、エラーメッセージを構築
      if (error.errors) {
        const errorMessages = Object.values(error.errors).flat();
        throw new Error(
          errorMessages.join(", ") ||
            error.message ||
            "ユーザー登録に失敗しました"
        );
      }
      throw new Error(error.message || "ユーザー登録に失敗しました");
    }

    const result: ApiResponse<RegisterResponse> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.message || "ユーザー登録に失敗しました");
    }
    return result.data;
  },
};
