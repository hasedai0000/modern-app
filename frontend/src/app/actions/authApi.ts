"use server";

import { StatusCodes } from "http-status-codes";

import { postFetch, getFetchWithAuth } from "./fetch";
import type { RegisterRequest, RegisterResponse } from "@/types/auth";
import { ResponseType, IErrorResponse } from "@/types/ApiResponse";

/**
 * 新規ユーザー登録
 * Firebase 認証後に Laravel API へユーザー情報を登録する
 */
export const registerUser = async (req: RegisterRequest, token: string) => {
  try {
    const response = await postFetch({
      path: "auth/register",
      body: { ...req },
      token,
    });
    const data = await response.json();
    const status = response.status;

    if (status === StatusCodes.CREATED) {
      const res: ResponseType<RegisterResponse> = {
        status: status,
        data: data.data,
      };
      return res;
    }

    // Laravelのバリデーションエラー（422）の詳細メッセージを抽出
    let error_message = data?.message || "ユーザー登録に失敗しました。";
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
 * ログイン後のユーザー検証
 * Firebase 認証後に Laravel API でユーザーが登録済みか確認する
 * 未登録の場合は ResponseType でエラーを返す（新規登録へ誘導する用途）
 */
export const verifyUserAfterLogin = async (token: string) => {
  try {
    const response = await getFetchWithAuth({
      path: "user",
      token,
    });
    const data = await response.json();
    const status = response.status;

    if (status === StatusCodes.OK && data?.success && data?.data?.id != null) {
      const res: ResponseType<{ id: number }> = {
        status: status,
        data: { id: data.data.id },
      };
      return res;
    }

    const res: ResponseType = {
      status: status,
      errorCode: status.toString(),
      errorMessage:
        data?.message ||
        "ユーザーが登録されていません。新規登録を行ってください。",
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
