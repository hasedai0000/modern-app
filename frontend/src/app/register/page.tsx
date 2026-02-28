"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { registerUser } from "@/app/actions/authApi";
import {
  validateRegister,
  hasValidationErrors,
} from "@/lib/validations/register";
import { useRouter } from "next/navigation";
import AuthHeader from "@/components/AuthHeader";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const validation_errors = validateRegister(username, email, password);
    if (hasValidationErrors(validation_errors)) {
      const first_error =
        validation_errors.username ||
        validation_errors.email ||
        validation_errors.password ||
        "";
      setError(first_error);
      return;
    }

    setLoading(true);

    try {
      // Firebase設定の確認
      if (!auth) {
        const errorMessage =
          "Firebaseが正しく設定されていません。環境変数を確認してください。\n" +
          "ブラウザのコンソールで詳細なエラー情報を確認してください。";
        setError(errorMessage);
        setLoading(false);
        console.error(
          "Firebase auth is not initialized. Check environment variables.",
        );
        return;
      }

      // Firebase Authenticationでユーザー作成
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // プロフィールにユーザーネームを設定
      await updateProfile(userCredential.user, {
        displayName: username,
      });

      // LaravelのAPIにユーザー情報を送信（registerUser Server Action を使用）
      const token = await userCredential.user.getIdToken();
      const res = await registerUser(
        {
          firebase_uid: userCredential.user.uid,
          user_name: username,
          email: email,
        },
        token,
      );

      if (res.data) {
        router.push("/");
        return;
      }

      // APIエラー時はFirebaseユーザーを削除して再試行を可能にする
      try {
        await userCredential.user.delete();
      } catch (delete_err) {
        console.error("Firebase user cleanup failed:", delete_err);
      }
      setError(res.errorMessage || "ユーザー登録に失敗しました。");
    } catch (err: unknown) {
      let errorMessage = "新規登録に失敗しました。";

      // Firebase認証エラー
      if (err && typeof err === "object" && "code" in err) {
        const code = (err as { code: string }).code;
        if (code === "auth/email-already-in-use") {
          errorMessage = "このメールアドレスは既に使用されています。";
        } else if (code === "auth/invalid-email") {
          errorMessage = "有効なメールアドレスを入力してください。";
        } else if (code === "auth/weak-password") {
          errorMessage =
            "パスワードが弱すぎます。より強力なパスワードを入力してください。";
        } else if (code === "auth/configuration-not-found") {
          errorMessage =
            "Firebase設定が見つかりません。環境変数を確認してください。";
        } else if (
          "message" in err &&
          typeof (err as { message: string }).message === "string"
        ) {
          errorMessage = (err as { message: string }).message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1B2631] flex flex-col">
      {/* ヘッダー */}
      <AuthHeader />

      {/* メインコンテンツ */}
      <main className="flex-1 flex items-start justify-center px-4 pt-12">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-black mb-6">
            新規登録
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            suppressHydrationWarning
          >
            <div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="ユーザーネームを入力"
              />
            </div>

            <div>
              <input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="メールアドレスを入力"
              />
            </div>

            <div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="パスワードを入力"
              />
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-full border-4 border-t-gray-500 border-l-gray-500 border-r-gray-900 border-b-gray-900 shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "登録中..." : "新規登録"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
