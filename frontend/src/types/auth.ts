export type RegisterRequest = {
  firebase_uid: string;
  user_name: string;
  email: string;
};

export type RegisterResponse = {
  id: number;
  firebase_uid: string;
  user_name: string;
  email: string;
  created_at: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
};
