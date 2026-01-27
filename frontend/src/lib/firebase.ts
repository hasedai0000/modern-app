import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase設定の検証
const isFirebaseConfigValid = () => {
  return (
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

if (typeof window !== "undefined") {
  if (!isFirebaseConfigValid()) {
    const missingVars = [];
    if (!firebaseConfig.apiKey)
      missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");
    if (!firebaseConfig.authDomain)
      missingVars.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
    if (!firebaseConfig.projectId)
      missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    if (!firebaseConfig.storageBucket)
      missingVars.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
    if (!firebaseConfig.messagingSenderId)
      missingVars.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
    if (!firebaseConfig.appId) missingVars.push("NEXT_PUBLIC_FIREBASE_APP_ID");

    console.error(
      "❌ Firebase設定が不完全です。以下の環境変数が設定されていません:"
    );
    console.error("未設定の環境変数:", missingVars);
    console.error("\n📝 設定方法:");
    console.error("1. frontend/.env.local ファイルを作成");
    console.error(
      "2. Firebase Console (https://console.firebase.google.com/) から設定値を取得"
    );
    console.error("3. .env.local に環境変数を設定");
    console.error("4. 開発サーバーを再起動 (npm run dev)");
  } else {
    try {
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
        console.log("✅ Firebase初期化成功");
      } else {
        app = getApps()[0];
      }
      auth = getAuth(app);
    } catch (error: any) {
      console.error("❌ Firebase初期化エラー:", error);
      if (error.code === "app/no-app") {
        console.error(
          "Firebaseアプリが初期化されていません。設定を確認してください。"
        );
      }
    }
  }
} else {
  // サーバーサイドレンダリング時
  console.warn("Firebaseはクライアントサイドでのみ初期化されます。");
}

export { auth };
