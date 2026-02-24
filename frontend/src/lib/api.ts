import { auth } from "./firebase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!auth?.currentUser) return null;
  return await auth.currentUser.getIdToken();
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
  return fetch(`${API_BASE_URL}${url}`, { ...options, headers });
}

/**
 * Laravel API のエラーレスポンスからメッセージを抽出
 * json.message または json.errors の内容を結合して返す
 */
function extractErrorMessage(json: {
  message?: string;
  errors?: Record<string, string[]>;
}): string {
  if (json.message) return json.message;
  if (json.errors && typeof json.errors === "object") {
    const messages: string[] = [];
    for (const key of Object.keys(json.errors)) {
      const fieldErrors = json.errors[key];
      if (Array.isArray(fieldErrors)) messages.push(...fieldErrors);
    }
    if (messages.length > 0) return messages.join(" ");
  }
  return "";
}

// 型定義
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

// API クライアント
export const api = {
  async getCurrentUser(): Promise<{ id: number } | null> {
    const response = await fetchWithAuth("/user");
    if (!response.ok) return null;
    const json = await response.json();
    return json.data?.id != null ? { id: json.data.id } : null;
  },

  async getPosts(page: number = 1): Promise<PostsResponse> {
    const response = await fetchWithAuth(`/posts?page=${page}`);
    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(json.message || "投稿の取得に失敗しました");
    }
    return json;
  },

  async createPost(content: string): Promise<Post> {
    const response = await fetchWithAuth("/posts", {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    let json: { success?: boolean; data?: Post; message?: string; errors?: Record<string, string[]> };
    try {
      json = await response.json();
    } catch {
      throw new Error(`投稿の作成に失敗しました（HTTP ${response.status}）`);
    }
    if (!response.ok || !json.success || !json.data) {
      const message = extractErrorMessage(json);
      throw new Error(message || `投稿の作成に失敗しました（HTTP ${response.status}）`);
    }
    return json.data;
  },

  async deletePost(id: number): Promise<void> {
    const response = await fetchWithAuth(`/posts/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const json = await response.json();
      throw new Error(json.message || "投稿の削除に失敗しました");
    }
  },

  async toggleLike(
    postId: number
  ): Promise<{ post_id: number; is_liked: boolean; likes_count: number }> {
    const response = await fetchWithAuth(`/posts/${postId}/like`, {
      method: "POST",
    });
    const json = await response.json();
    if (!response.ok || !json.success || !json.data) {
      throw new Error(json.message || "いいねの処理に失敗しました");
    }
    return json.data;
  },

  async getPost(id: number): Promise<Post> {
    const response = await fetchWithAuth(`/posts/${id}`);
    const json = await response.json();
    if (!response.ok || !json.success || !json.data) {
      throw new Error(json.message || "投稿の取得に失敗しました");
    }
    return json.data;
  },

  async getComments(postId: number): Promise<Comment[]> {
    const response = await fetchWithAuth(`/posts/${postId}/comments`);
    const json = await response.json();
    if (!response.ok || !json.success || !json.data) {
      throw new Error(json.message || "コメントの取得に失敗しました");
    }
    return json.data;
  },

  async createComment(postId: number, content: string): Promise<Comment> {
    const response = await fetchWithAuth(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    const json = await response.json();
    if (!response.ok || !json.success || !json.data) {
      throw new Error(json.message || "コメントの作成に失敗しました");
    }
    return json.data;
  },

  async register(
    data: RegisterRequest,
    token: string
  ): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok || !json.success || !json.data) {
      throw new Error(json.message || "ユーザー登録に失敗しました");
    }
    return json.data;
  },
};
