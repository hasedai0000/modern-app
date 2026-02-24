"use server";

import { StatusCodes } from "http-status-codes";

import {
  getFetchForPath,
  postFetch,
  deleteFetchWithAuth,
} from "./fetch";
import type {
  Post,
  Comment,
  CreatePostRequest,
  CreateCommentRequest,
  ToggleLikeResponse,
} from "@/types/post";
import { ResponseType, IErrorResponse } from "@/types/ApiResponse";

/**
 * 投稿一覧を取得する（公開エンドポイント）
 */
export const getPosts = async (page: number = 1) => {
  try {
    const response = await getFetchForPath({
      path: `posts?page=${page}`,
    });
    const data = await response.json();
    const status = response.status;

    if (status === StatusCodes.OK && data?.success && Array.isArray(data?.data)) {
      const res: ResponseType<Post[]> = {
        status: status,
        data: data.data,
      };
      return res;
    }

    const res: ResponseType = {
      status: status,
      errorCode: status.toString(),
      errorMessage: data?.message || "投稿の取得に失敗しました。",
    };
    return res;
  } catch (error) {
    const res: ResponseType = {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      errorCode: `${StatusCodes.INTERNAL_SERVER_ERROR}`,
      errorMessage: `Internet Server Error: ${error}`,
    };
    const fetch_error = error as IErrorResponse;
    if (typeof fetch_error?.status === "number") {
      res.status = fetch_error.status;
      res.errorCode = fetch_error.status.toString();
      res.errorMessage = fetch_error.statusText;
    }
    return res;
  }
};

/**
 * 投稿を作成する（認証必須）
 */
export const createPost = async (req: CreatePostRequest, token: string) => {
  try {
    const response = await postFetch({
      path: "posts",
      body: { ...req },
      token,
    });
    const data = await response.json();
    const status = response.status;

    if (status === StatusCodes.CREATED && data?.success && data?.data) {
      const res: ResponseType<Post> = {
        status: status,
        data: data.data,
      };
      return res;
    }

    let error_message = data?.message || "投稿の作成に失敗しました。";
    if (data?.errors && typeof data.errors === "object") {
      const messages: string[] = [];
      for (const key of Object.keys(data.errors)) {
        const field_errors = data.errors[key];
        if (Array.isArray(field_errors)) {
          messages.push(...field_errors);
        }
      }
      if (messages.length > 0) {
        error_message = messages.join(" ");
      }
    }

    const res: ResponseType = {
      status: status,
      errorCode: status.toString(),
      errorMessage: error_message,
    };
    return res;
  } catch (error) {
    const res: ResponseType = {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      errorCode: `${StatusCodes.INTERNAL_SERVER_ERROR}`,
      errorMessage: `Internet Server Error: ${error}`,
    };
    const fetch_error = error as IErrorResponse;
    if (typeof fetch_error?.status === "number") {
      res.status = fetch_error.status;
      res.errorCode = fetch_error.status.toString();
      res.errorMessage = fetch_error.statusText;
    }
    return res;
  }
};

/**
 * 投稿を削除する（認証必須、投稿者のみ）
 */
export const deletePost = async (id: number, token: string) => {
  try {
    const response = await deleteFetchWithAuth({
      path: `posts/${id}`,
      token,
    });
    const data = await response.json();
    const status = response.status;

    if (status === StatusCodes.OK) {
      const res: ResponseType<null> = {
        status: status,
        data: null,
      };
      return res;
    }

    const res: ResponseType = {
      status: status,
      errorCode: status.toString(),
      errorMessage:
        data?.message || "投稿の削除に失敗しました。",
    };
    return res;
  } catch (error) {
    const res: ResponseType = {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      errorCode: `${StatusCodes.INTERNAL_SERVER_ERROR}`,
      errorMessage: `Internet Server Error: ${error}`,
    };
    const fetch_error = error as IErrorResponse;
    if (typeof fetch_error?.status === "number") {
      res.status = fetch_error.status;
      res.errorCode = fetch_error.status.toString();
      res.errorMessage = fetch_error.statusText;
    }
    return res;
  }
};

/**
 * 投稿詳細を取得する（公開エンドポイント）
 */
export const getPost = async (id: number) => {
  try {
    const response = await getFetchForPath({
      path: `posts/${id}`,
    });
    const data = await response.json();
    const status = response.status;

    if (status === StatusCodes.OK && data?.success && data?.data) {
      const res: ResponseType<Post> = {
        status: status,
        data: data.data,
      };
      return res;
    }

    const res: ResponseType = {
      status: status,
      errorCode: status.toString(),
      errorMessage: data?.message || "投稿の取得に失敗しました。",
    };
    return res;
  } catch (error) {
    const res: ResponseType = {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      errorCode: `${StatusCodes.INTERNAL_SERVER_ERROR}`,
      errorMessage: `Internet Server Error: ${error}`,
    };
    const fetch_error = error as IErrorResponse;
    if (typeof fetch_error?.status === "number") {
      res.status = fetch_error.status;
      res.errorCode = fetch_error.status.toString();
      res.errorMessage = fetch_error.statusText;
    }
    return res;
  }
};

/**
 * いいねのトグル（認証必須）
 */
export const toggleLike = async (post_id: number, token: string) => {
  try {
    const response = await postFetch({
      path: `posts/${post_id}/like`,
      body: {},
      token,
    });
    const data = await response.json();
    const status = response.status;

    if (status === StatusCodes.OK && data?.success && data?.data) {
      const res: ResponseType<ToggleLikeResponse> = {
        status: status,
        data: data.data,
      };
      return res;
    }

    const res: ResponseType = {
      status: status,
      errorCode: status.toString(),
      errorMessage: data?.message || "いいねの処理に失敗しました。",
    };
    return res;
  } catch (error) {
    const res: ResponseType = {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      errorCode: `${StatusCodes.INTERNAL_SERVER_ERROR}`,
      errorMessage: `Internet Server Error: ${error}`,
    };
    const fetch_error = error as IErrorResponse;
    if (typeof fetch_error?.status === "number") {
      res.status = fetch_error.status;
      res.errorCode = fetch_error.status.toString();
      res.errorMessage = fetch_error.statusText;
    }
    return res;
  }
};

/**
 * コメント一覧を取得する（公開エンドポイント）
 */
export const getComments = async (post_id: number) => {
  try {
    const response = await getFetchForPath({
      path: `posts/${post_id}/comments`,
    });
    const data = await response.json();
    const status = response.status;

    if (status === StatusCodes.OK && data?.success && Array.isArray(data?.data)) {
      const res: ResponseType<Comment[]> = {
        status: status,
        data: data.data,
      };
      return res;
    }

    const res: ResponseType = {
      status: status,
      errorCode: status.toString(),
      errorMessage: data?.message || "コメントの取得に失敗しました。",
    };
    return res;
  } catch (error) {
    const res: ResponseType = {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      errorCode: `${StatusCodes.INTERNAL_SERVER_ERROR}`,
      errorMessage: `Internet Server Error: ${error}`,
    };
    const fetch_error = error as IErrorResponse;
    if (typeof fetch_error?.status === "number") {
      res.status = fetch_error.status;
      res.errorCode = fetch_error.status.toString();
      res.errorMessage = fetch_error.statusText;
    }
    return res;
  }
};

/**
 * コメントを作成する（認証必須）
 */
export const createComment = async (
  post_id: number,
  req: CreateCommentRequest,
  token: string
) => {
  try {
    const response = await postFetch({
      path: `posts/${post_id}/comments`,
      body: { ...req },
      token,
    });
    const data = await response.json();
    const status = response.status;

    if (status === StatusCodes.CREATED && data?.success && data?.data) {
      const res: ResponseType<Comment> = {
        status: status,
        data: data.data,
      };
      return res;
    }

    let error_message = data?.message || "コメントの作成に失敗しました。";
    if (data?.errors && typeof data.errors === "object") {
      const messages: string[] = [];
      for (const key of Object.keys(data.errors)) {
        const field_errors = data.errors[key];
        if (Array.isArray(field_errors)) {
          messages.push(...field_errors);
        }
      }
      if (messages.length > 0) {
        error_message = messages.join(" ");
      }
    }

    const res: ResponseType = {
      status: status,
      errorCode: status.toString(),
      errorMessage: error_message,
    };
    return res;
  } catch (error) {
    const res: ResponseType = {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      errorCode: `${StatusCodes.INTERNAL_SERVER_ERROR}`,
      errorMessage: `Internet Server Error: ${error}`,
    };
    const fetch_error = error as IErrorResponse;
    if (typeof fetch_error?.status === "number") {
      res.status = fetch_error.status;
      res.errorCode = fetch_error.status.toString();
      res.errorMessage = fetch_error.statusText;
    }
    return res;
  }
};
