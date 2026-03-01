# テスト仕様書

**プロジェクト名**: Twitter 風 SNS アプリ  
**作成日**: 2026-02-28  
**対象バージョン**: Laravel 8.x / Next.js 15.x

---

## 目次

1. [テスト環境](#1-テスト環境)
2. [環境構築テスト](#2-環境構築テスト)
3. [データベーステスト](#3-データベーステスト)
4. [認証テスト](#4-認証テスト)
5. [投稿機能テスト](#5-投稿機能テスト)
6. [いいね機能テスト](#6-いいね機能テスト)
7. [コメント機能テスト](#7-コメント機能テスト)
8. [バリデーションテスト](#8-バリデーションテスト)
9. [認可テスト](#9-認可テスト)
10. [フロントエンド画面テスト](#10-フロントエンド画面テスト)
11. [エラーハンドリングテスト](#11-エラーハンドリングテスト)

---

## 1. テスト環境

### 1.1 使用ツール

| ツール | 用途 |
| --- | --- |
| PHPUnit | Laravel バックエンドのユニット・フィーチャーテスト |
| Docker / Docker Compose | コンテナ環境の起動・管理 |
| PHPMyAdmin | DB データの目視確認（http://localhost:8080） |
| MailHog | メール送信の確認（http://localhost:8025） |
| ブラウザ (Chrome 等) | フロントエンドの画面テスト |

### 1.2 テスト対象 URL

| サービス | URL |
| --- | --- |
| フロントエンド (Next.js) | http://localhost:3000 |
| バックエンド API (Laravel) | http://localhost/api |
| PHPMyAdmin | http://localhost:8080 |
| MailHog | http://localhost:8025 |

### 1.3 テストデータ

| 種別 | 内容 |
| --- | --- |
| テストユーザー A | email: test_a@example.com / password: password123 |
| テストユーザー B | email: test_b@example.com / password: password123 |
| 無効なメール | invalid-email |
| 長すぎるユーザー名 | 21文字以上の文字列 |
| 長すぎる投稿内容 | 121文字以上の文字列 |

---

## 2. 環境構築テスト

### TC-ENV-001: Docker コンテナのビルドと起動

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-ENV-001 |
| **テスト名** | Docker コンテナのビルドと起動 |
| **前提条件** | Docker Desktop がインストールされていること |

**手順**:

```bash
# リポジトリをクローン
git clone <repository-url>
cd modern-app

# コンテナをビルドして起動
docker compose up -d --build
```

**確認コマンド**:

```bash
docker compose ps
```

**期待結果**:

| サービス | 状態 |
| --- | --- |
| nginx | Up (port 80) |
| php | Up |
| mysql | Up |
| phpmyadmin | Up (port 8080) |
| mailhog | Up (port 1025, 8025) |

**合否判定**: 全サービスが `Up` 状態になること

---

### TC-ENV-002: Laravel 依存関係のインストール

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-ENV-002 |
| **テスト名** | Composer による依存関係インストール |
| **前提条件** | TC-ENV-001 が合格していること |

**手順**:

```bash
docker compose exec php bash
composer install
```

**期待結果**: `Generating optimized autoload files` が表示され、エラーなく完了すること

---

### TC-ENV-003: .env ファイルの設定と APP_KEY 生成

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-ENV-003 |
| **テスト名** | 環境変数ファイルのセットアップ |
| **前提条件** | TC-ENV-002 が合格していること |

**手順** (PHP コンテナ内で実行):

```bash
cp .env.example .env
php artisan key:generate
```

`.env` に以下を設定:

```
DB_DATABASE=laravel_db
DB_USERNAME=laravel_user
DB_PASSWORD=laravel_pass
DB_HOST=mysql
```

**期待結果**: `APP_KEY=base64:...` の形式でキーが生成されること

---

### TC-ENV-004: データベースマイグレーションの実行

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-ENV-004 |
| **テスト名** | マイグレーション実行 |
| **前提条件** | TC-ENV-003 が合格していること |

**手順** (PHP コンテナ内で実行):

```bash
php artisan migrate:fresh --seed
```

**期待結果**: 以下のテーブルが `laravel_db` に作成されること

- `users`
- `posts`
- `likes`
- `comments`
- `migrations`
- `personal_access_tokens` (Laravel 標準)

**確認方法**: PHPMyAdmin (http://localhost:8080) でテーブルの存在を確認

---

### TC-ENV-005: フロントエンドの環境変数設定と起動

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-ENV-005 |
| **テスト名** | Next.js フロントエンドの起動確認 |
| **前提条件** | Firebase プロジェクトが作成済みであること |

**手順**:

```bash
cd frontend

# .env.local を作成して Firebase 設定を記入
cp .env.local.example .env.local  # または手動作成
# NEXT_PUBLIC_FIREBASE_API_KEY=...
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
# NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
# NEXT_PUBLIC_FIREBASE_APP_ID=...
# NEXT_PUBLIC_API_BASE_URL=/api

npm install
npm run dev
```

**期待結果**: `http://localhost:3000` でフロントエンドが表示されること

---

### TC-ENV-006: Firebase Authentication の有効化確認

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-ENV-006 |
| **テスト名** | Firebase メール/パスワード認証の有効化 |
| **前提条件** | Firebase Console にアクセスできること |

**確認手順**:

1. Firebase Console (https://console.firebase.google.com/) にアクセス
2. 対象プロジェクトを選択
3. 「Authentication」→「Sign-in method」を開く
4. 「メール/パスワード」が「有効」になっていることを確認

**期待結果**: メール/パスワード認証プロバイダーが「有効」状態であること  
**注意**: 無効の場合、`auth/configuration-not-found` エラーが発生する

---

## 3. データベーステスト

### TC-DB-001: users テーブルの構造確認

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-DB-001 |
| **テスト名** | users テーブルのカラム定義確認 |

**確認コマンド** (MySQL コンテナ内):

```bash
docker compose exec mysql mysql -u laravel_user -plaravel_pass laravel_db -e "DESCRIBE users;"
```

**期待結果**:

| カラム名 | データ型 | NULL許可 | Key |
| --- | --- | --- | --- |
| id | bigint unsigned | NO | PRI |
| user_name | varchar(255) | NO | - |
| email | varchar(255) | NO | UNI |
| password | varchar(255) | NO | - |
| created_at | timestamp | YES | - |
| updated_at | timestamp | YES | - |

---

### TC-DB-002: posts テーブルの構造確認

**確認コマンド**:

```bash
docker compose exec mysql mysql -u laravel_user -plaravel_pass laravel_db -e "DESCRIBE posts;"
```

**期待結果**:

| カラム名 | データ型 | NULL許可 | Key |
| --- | --- | --- | --- |
| id | bigint unsigned | NO | PRI |
| user_id | bigint unsigned | NO | MUL |
| content | text | NO | - |
| created_at | timestamp | YES | - |
| updated_at | timestamp | YES | - |

---

### TC-DB-003: likes テーブルのユニーク制約確認

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-DB-003 |
| **テスト名** | likes テーブルの複合ユニーク制約 |

**確認コマンド**:

```bash
docker compose exec mysql mysql -u laravel_user -plaravel_pass laravel_db -e "SHOW INDEX FROM likes;"
```

**期待結果**: `user_id` と `post_id` の組み合わせに UNIQUE インデックスが存在すること

---

### TC-DB-004: 外部キー制約のカスケード削除確認

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-DB-004 |
| **テスト名** | ON DELETE CASCADE の動作確認 |

**手順**:

1. テストユーザー、投稿、いいね、コメントを作成
2. 投稿を削除
3. 関連するいいね・コメントが自動削除されることを確認

**期待結果**: 投稿削除時に該当投稿の `likes` および `comments` レコードも削除されること

---

## 4. 認証テスト

### TC-AUTH-001: 新規ユーザー登録（正常系）

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-AUTH-001 |
| **テスト名** | 正常な新規登録 |
| **対象画面** | `/register` |

**手順**:

1. `http://localhost:3000/register` にアクセス
2. ユーザーネーム: `testuser`
3. メールアドレス: `test@example.com`
4. パスワード: `password123`
5. 「登録」ボタンをクリック

**期待結果**:

- Firebase Authentication にユーザーが作成される
- `POST /api/auth/register` が呼ばれ、`users` テーブルにレコードが追加される
- 投稿一覧画面（`/`）にリダイレクトされる

---

### TC-AUTH-002: ログイン（正常系）

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-AUTH-002 |
| **テスト名** | 正常なログイン |
| **対象画面** | `/login` |
| **前提条件** | TC-AUTH-001 で登録済みのユーザーが存在すること |

**手順**:

1. `http://localhost:3000/login` にアクセス
2. メールアドレス: `test@example.com`
3. パスワード: `password123`
4. 「ログイン」ボタンをクリック

**期待結果**:

- ログインに成功する
- 投稿一覧画面（`/`）にリダイレクトされる
- サイドバーにログイン状態が表示される

---

### TC-AUTH-003: ログアウト

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-AUTH-003 |
| **テスト名** | ログアウト処理 |
| **前提条件** | ログイン状態であること |

**手順**:

1. サイドバーの「ログアウト」をクリック

**期待結果**:

- Firebase Authentication からログアウトされる
- ログイン画面（`/login`）にリダイレクトされる

---

### TC-AUTH-004: 未認証ユーザーの保護ルートへのアクセス

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-AUTH-004 |
| **テスト名** | 未ログイン時の認証必須 API へのアクセス制御 |

**手順** (curl で直接テスト):

```bash
# 認証なしで投稿を作成しようとする
curl -X POST http://localhost/api/posts \
  -H "Content-Type: application/json" \
  -d '{"content": "test post"}'
```

**期待結果**: HTTP 401 Unauthorized が返却される

---

### TC-AUTH-005: Laravel API でのユーザー情報取得

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-AUTH-005 |
| **テスト名** | GET /api/user の動作確認 |

**手順**:

```bash
# 有効な Firebase ID トークンを取得後
curl -X GET http://localhost/api/user \
  -H "Authorization: Bearer <firebase_id_token>"
```

**期待結果**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_name": "testuser",
    "email": "test@example.com"
  }
}
```

---

### TC-AUTH-006: POST /api/auth/register の動作確認

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-AUTH-006 |
| **テスト名** | ユーザー登録 API の正常系 |

**リクエスト**:

```bash
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firebase_uid": "abc123",
    "user_name": "newuser",
    "email": "new@example.com"
  }'
```

**期待結果**:

- HTTP 200 または 201 が返却される
- `users` テーブルに新規レコードが追加される
- レスポンスに `success: true` と登録ユーザー情報が含まれる

---

## 5. 投稿機能テスト

### TC-POST-001: 投稿一覧の取得（正常系）

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-POST-001 |
| **テスト名** | GET /api/posts の動作確認 |

**手順**:

```bash
curl -X GET http://localhost/api/posts
```

**期待結果**:

- HTTP 200 が返却される
- レスポンスに投稿一覧が含まれる
- 各投稿に以下のフィールドが存在する:
  - `id`
  - `content`
  - `created_at`
  - ユーザー名（`user.user_name` または同等）
  - `likes_count`（いいね数）
  - `comments_count`（コメント数）
- 作成日時の降順（最新順）でソートされている

---

### TC-POST-002: ページネーションの動作確認

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-POST-002 |
| **テスト名** | 投稿一覧のページネーション |

**手順**:

```bash
curl -X GET "http://localhost/api/posts?page=1"
curl -X GET "http://localhost/api/posts?page=2"
```

**期待結果**:

- `page=1` と `page=2` で異なる投稿が返却される
- レスポンスにページネーション情報（`total`, `per_page`, `current_page` 等）が含まれる

---

### TC-POST-003: 投稿の詳細取得（正常系）

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-POST-003 |
| **テスト名** | GET /api/posts/{id} の動作確認 |

**手順**:

```bash
curl -X GET http://localhost/api/posts/1
```

**期待結果**:

- HTTP 200 が返却される
- 指定した ID の投稿データが返却される

---

### TC-POST-004: 存在しない投稿の取得（異常系）

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-POST-004 |
| **テスト名** | 存在しない投稿 ID での GET リクエスト |

**手順**:

```bash
curl -X GET http://localhost/api/posts/99999
```

**期待結果**: HTTP 404 Not Found が返却される

---

### TC-POST-005: 投稿の作成（正常系）

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-POST-005 |
| **テスト名** | POST /api/posts の正常動作確認 |
| **前提条件** | 認証済みユーザーの ID トークンを取得済みであること |

**手順**:

```bash
curl -X POST http://localhost/api/posts \
  -H "Authorization: Bearer <firebase_id_token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "テスト投稿です"}'
```

**期待結果**:

- HTTP 200 または 201 が返却される
- `posts` テーブルに新規レコードが追加される
- レスポンスに作成された投稿情報が含まれる

---

### TC-POST-006: 自分の投稿の削除（正常系）

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-POST-006 |
| **テスト名** | DELETE /api/posts/{id} の正常動作確認 |
| **前提条件** | 削除対象の投稿が認証済みユーザーの投稿であること |

**手順**:

```bash
curl -X DELETE http://localhost/api/posts/1 \
  -H "Authorization: Bearer <firebase_id_token>"
```

**期待結果**:

- HTTP 200 が返却される
- `posts` テーブルから該当レコードが削除される
- 関連する `likes`, `comments` も CASCADE 削除される

---

### TC-POST-007: 他人の投稿の削除（異常系）

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-POST-007 |
| **テスト名** | 他ユーザーの投稿削除試行 |
| **前提条件** | ユーザー A の投稿が存在し、ユーザー B でログインしていること |

**手順**:

```bash
# ユーザー B のトークンでユーザー A の投稿を削除しようとする
curl -X DELETE http://localhost/api/posts/<user_a_post_id> \
  -H "Authorization: Bearer <user_b_token>"
```

**期待結果**: HTTP 403 Forbidden が返却される

---

### TC-POST-008: 画面からの投稿作成・削除確認

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-POST-008 |
| **テスト名** | フロントエンドでの投稿操作確認 |
| **対象画面** | `/`（投稿一覧） |

**手順**:

1. ログイン状態で `http://localhost:3000` にアクセス
2. 投稿入力フォームに「テスト投稿」と入力し「投稿」ボタンをクリック
3. 投稿一覧に新しい投稿が追加されることを確認
4. 自分の投稿の「×（削除）」ボタンをクリック
5. 投稿が一覧から削除されることを確認

**期待結果**:

- 投稿後、即座に一覧に表示される
- 削除後、一覧から即座に消える
- 他人の投稿には削除ボタンが表示されない

---

## 6. いいね機能テスト

### TC-LIKE-001: いいねの追加（正常系）

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-LIKE-001 |
| **テスト名** | POST /api/posts/{id}/like によるいいね追加 |
| **前提条件** | 対象投稿が存在し、認証済みであること |

**手順**:

```bash
curl -X POST http://localhost/api/posts/1/like \
  -H "Authorization: Bearer <firebase_id_token>"
```

**期待結果**:

- HTTP 200 が返却される
- `likes` テーブルに新規レコードが追加される
- レスポンスにいいね状態（`liked: true`等）が含まれる

---

### TC-LIKE-002: いいねのトグル（取り消し）

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-LIKE-002 |
| **テスト名** | 同じ投稿に2回いいねするとトグル（取り消し）される |
| **前提条件** | TC-LIKE-001 を実行済みであること |

**手順**:

```bash
# 同じエンドポイントを再度リクエスト
curl -X POST http://localhost/api/posts/1/like \
  -H "Authorization: Bearer <firebase_id_token>"
```

**期待結果**:

- HTTP 200 が返却される
- `likes` テーブルから該当レコードが削除される
- レスポンスにいいね状態（`liked: false`等）が含まれる

---

### TC-LIKE-003: 同一投稿への重複いいね防止確認

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-LIKE-003 |
| **テスト名** | likes テーブルの複合ユニーク制約動作確認 |

**確認コマンド** (MySQL コンテナ内):

```sql
-- 同じ user_id, post_id の組み合わせを2件INSERT しようとする
INSERT INTO likes (user_id, post_id, created_at) VALUES (1, 1, NOW());
INSERT INTO likes (user_id, post_id, created_at) VALUES (1, 1, NOW());
```

**期待結果**: 2件目の INSERT で `Duplicate entry` エラーが発生する

---

### TC-LIKE-004: 画面でのいいねリアルタイム更新確認

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-LIKE-004 |
| **テスト名** | フロントエンドでのいいねボタン動作確認 |
| **対象画面** | `/`（投稿一覧） |

**手順**:

1. ログイン状態で投稿一覧を表示
2. 任意の投稿のハートマーク（いいねボタン）をクリック
3. いいね数が即座に増加することを確認
4. 同じボタンをもう一度クリック
5. いいね数が即座に減少することを確認

**期待結果**:

- クリックごとにいいね数がリアルタイムで更新される
- いいね済みの状態でハートマークの色/スタイルが変化する

---

## 7. コメント機能テスト

### TC-COMMENT-001: コメント一覧の取得（正常系）

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-COMMENT-001 |
| **テスト名** | GET /api/posts/{id}/comments の動作確認 |

**手順**:

```bash
curl -X GET http://localhost/api/posts/1/comments
```

**期待結果**:

- HTTP 200 が返却される
- 該当投稿のコメント一覧が返却される
- 各コメントに以下のフィールドが存在する:
  - `id`
  - `content`
  - `created_at`
  - コメントしたユーザー名
- 作成日時の昇順（古い順）でソートされている

---

### TC-COMMENT-002: 存在しない投稿のコメント取得（異常系）

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-COMMENT-002 |
| **テスト名** | 存在しない投稿 ID でのコメント取得 |

**手順**:

```bash
curl -X GET http://localhost/api/posts/99999/comments
```

**期待結果**: HTTP 404 Not Found が返却される

---

### TC-COMMENT-003: コメントの追加（正常系）

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-COMMENT-003 |
| **テスト名** | POST /api/posts/{id}/comments の正常動作確認 |
| **前提条件** | 認証済みユーザーのトークンを取得済みであること |

**手順**:

```bash
curl -X POST http://localhost/api/posts/1/comments \
  -H "Authorization: Bearer <firebase_id_token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "テストコメントです"}'
```

**期待結果**:

- HTTP 200 または 201 が返却される
- `comments` テーブルに新規レコードが追加される
- レスポンスに作成されたコメント情報が含まれる

---

### TC-COMMENT-004: コメント画面への遷移確認

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-COMMENT-004 |
| **テスト名** | 投稿一覧からコメント画面への遷移 |
| **対象画面** | `/` → `/posts/{id}/comments` |

**手順**:

1. 投稿一覧で任意の投稿の矢印マーク（コメントボタン）をクリック

**期待結果**:

- `/posts/{id}/comments` に遷移する
- 元の投稿が画面上部に表示される
- コメント一覧が表示される
- コメント入力フォームが下部に表示される

---

### TC-COMMENT-005: 画面からのコメント投稿確認

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-COMMENT-005 |
| **テスト名** | フロントエンドでのコメント追加確認 |
| **対象画面** | `/posts/{id}/comments` |
| **前提条件** | ログイン状態であること |

**手順**:

1. コメント入力フォームに「テストコメント」と入力
2. 送信ボタンをクリック

**期待結果**:

- コメント一覧に新しいコメントが追加される
- 入力フォームがクリアされる

---

## 8. バリデーションテスト

### TC-VAL-001: ユーザー登録 - ユーザーネーム20文字超え

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-VAL-001 |
| **テスト名** | ユーザーネームの最大文字数バリデーション |

**リクエスト**:

```bash
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firebase_uid": "abc123",
    "user_name": "123456789012345678901",
    "email": "test@example.com"
  }'
```

**期待結果**: HTTP 422 Unprocessable Entity が返却される（`user_name` のバリデーションエラー）

---

### TC-VAL-002: ユーザー登録 - メールアドレスの重複

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-VAL-002 |
| **テスト名** | メールアドレスのユニーク制約バリデーション |
| **前提条件** | 同じメールアドレスで登録済みのユーザーが存在すること |

**期待結果**: HTTP 422 が返却され、`email` のユニーク制約エラーメッセージが含まれる

---

### TC-VAL-003: 投稿内容 - 必須チェック

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-VAL-003 |
| **テスト名** | 投稿内容の必須バリデーション |

**リクエスト**:

```bash
curl -X POST http://localhost/api/posts \
  -H "Authorization: Bearer <firebase_id_token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**期待結果**: HTTP 422 が返却される（`content` の必須エラー）

---

### TC-VAL-004: 投稿内容 - 120文字超え

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-VAL-004 |
| **テスト名** | 投稿内容の最大文字数バリデーション（境界値テスト） |

| テストケース | 入力文字数 | 期待結果 |
| --- | --- | --- |
| 境界値（120文字） | 120文字 | 成功（HTTP 200/201） |
| 境界値+1（121文字） | 121文字 | 失敗（HTTP 422） |

---

### TC-VAL-005: コメント内容 - 120文字超え

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-VAL-005 |
| **テスト名** | コメント内容の最大文字数バリデーション（境界値テスト） |

| テストケース | 入力文字数 | 期待結果 |
| --- | --- | --- |
| 境界値（120文字） | 120文字 | 成功（HTTP 200/201） |
| 境界値+1（121文字） | 121文字 | 失敗（HTTP 422） |

---

### TC-VAL-006: フロントエンドのバリデーション表示

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-VAL-006 |
| **テスト名** | フロントエンド側バリデーションメッセージの表示 |

**手順**:

1. 登録画面で空のフォームを送信
2. ログイン画面で空のフォームを送信
3. 投稿フォームで空のテキストを送信
4. 120文字を超える投稿を送信

**期待結果**: 各画面でユーザーフレンドリーなエラーメッセージが表示される

---

## 9. 認可テスト

### TC-AUTHZ-001: 投稿削除 - 未認証

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-AUTHZ-001 |
| **テスト名** | 未認証状態での投稿削除試行 |

**リクエスト**:

```bash
curl -X DELETE http://localhost/api/posts/1
```

**期待結果**: HTTP 401 Unauthorized が返却される

---

### TC-AUTHZ-002: 他人の投稿削除 - 認証済みだが権限なし

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-AUTHZ-002 |
| **テスト名** | 他ユーザーの投稿削除試行（認可エラー） |

**期待結果**: HTTP 403 Forbidden が返却される

---

### TC-AUTHZ-003: 未認証でのいいね操作

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-AUTHZ-003 |
| **テスト名** | 未認証状態でのいいね操作試行 |

**リクエスト**:

```bash
curl -X POST http://localhost/api/posts/1/like
```

**期待結果**: HTTP 401 Unauthorized が返却される

---

### TC-AUTHZ-004: 未認証でのコメント投稿

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-AUTHZ-004 |
| **テスト名** | 未認証状態でのコメント投稿試行 |

**リクエスト**:

```bash
curl -X POST http://localhost/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -d '{"content": "コメント"}'
```

**期待結果**: HTTP 401 Unauthorized が返却される

---

## 10. フロントエンド画面テスト

### TC-UI-001: 投稿一覧画面の表示確認

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-UI-001 |
| **テスト名** | 投稿一覧画面の基本表示 |
| **対象画面** | `/` |

**確認項目**:

| 確認内容 | 期待結果 |
| --- | --- |
| 投稿カードの表示 | 各投稿のユーザー名・内容・日時が表示される |
| いいね数の表示 | ハートマークといいね数が表示される |
| コメント数の表示 | 矢印マークとコメント数が表示される |
| 自分の投稿への削除ボタン | ×マークが自分の投稿にのみ表示される |
| 他人の投稿への削除ボタン | ×マークが他人の投稿には表示されない |
| レスポンシブ対応 | モバイル・タブレット・デスクトップで正常に表示される |

---

### TC-UI-002: ログイン画面の表示確認

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-UI-002 |
| **テスト名** | ログイン画面の基本表示 |
| **対象画面** | `/login` |

**確認項目**:

- メールアドレス入力フィールドが表示される
- パスワード入力フィールドが表示される
- 「ログイン」ボタンが表示される
- 「新規登録」リンクが表示される

---

### TC-UI-003: 新規登録画面の表示確認

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-UI-003 |
| **テスト名** | 新規登録画面の基本表示 |
| **対象画面** | `/register` |

**確認項目**:

- ユーザーネーム入力フィールドが表示される
- メールアドレス入力フィールドが表示される
- パスワード入力フィールドが表示される
- 「登録」ボタンが表示される

---

### TC-UI-004: コメント画面の表示確認

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-UI-004 |
| **テスト名** | コメント画面の基本表示 |
| **対象画面** | `/posts/{id}/comments` |

**確認項目**:

- 元の投稿が画面上部に表示される
- コメント一覧が表示される
- コメント入力フォームが下部に表示される
- 送信ボタンが表示される

---

### TC-UI-005: サイドバーの表示確認

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-UI-005 |
| **テスト名** | サイドバーのログイン状態による表示切り替え |

| 状態 | 期待表示 |
| --- | --- |
| 未ログイン | ログインリンク・新規登録リンクが表示される |
| ログイン中 | ユーザー名・ログアウトボタンが表示される |

---

## 11. エラーハンドリングテスト

### TC-ERR-001: 無効な Firebase トークンでの API アクセス

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-ERR-001 |
| **テスト名** | 無効なトークンでの認証 |

**リクエスト**:

```bash
curl -X GET http://localhost/api/user \
  -H "Authorization: Bearer invalid_token_here"
```

**期待結果**: HTTP 401 Unauthorized が返却される

---

### TC-ERR-002: 不正な JSON リクエストボディ

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-ERR-002 |
| **テスト名** | 不正な JSON 形式でのリクエスト |

**リクエスト**:

```bash
curl -X POST http://localhost/api/posts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d 'not-a-json'
```

**期待結果**: HTTP 400 または 422 が返却される（機密情報が含まれないこと）

---

### TC-ERR-003: ネットワークエラー時のフロントエンド表示

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-ERR-003 |
| **テスト名** | API サーバーダウン時のエラー表示 |

**手順**:

1. バックエンドコンテナを停止: `docker compose stop php nginx`
2. フロントエンドから各操作を試みる

**期待結果**: ユーザーフレンドリーなエラーメッセージが表示され、アプリがクラッシュしないこと

---

### TC-ERR-004: PHPUnit によるバックエンド自動テスト実行

| 項目 | 内容 |
| --- | --- |
| **テストID** | TC-ERR-004 |
| **テスト名** | PHPUnit テストスイートの全テスト実行 |

**手順**:

```bash
docker compose exec php php artisan test
```

**期待結果**: 全テストが PASS すること（FAIL または ERROR が0件）

---

## テスト結果記録表

| テストID | テスト名 | 実施日 | 担当者 | 結果 | 備考 |
| --- | --- | --- | --- | --- | --- |
| TC-ENV-001 | Docker コンテナ起動 | | | ○/× | |
| TC-ENV-002 | composer install | | | ○/× | |
| TC-ENV-003 | .env 設定・KEY 生成 | | | ○/× | |
| TC-ENV-004 | DB マイグレーション | | | ○/× | |
| TC-ENV-005 | フロントエンド起動 | | | ○/× | |
| TC-ENV-006 | Firebase 有効化確認 | | | ○/× | |
| TC-DB-001 | users テーブル構造 | | | ○/× | |
| TC-DB-002 | posts テーブル構造 | | | ○/× | |
| TC-DB-003 | likes ユニーク制約 | | | ○/× | |
| TC-DB-004 | CASCADE 削除確認 | | | ○/× | |
| TC-AUTH-001 | 新規ユーザー登録 | | | ○/× | |
| TC-AUTH-002 | ログイン | | | ○/× | |
| TC-AUTH-003 | ログアウト | | | ○/× | |
| TC-AUTH-004 | 未認証アクセス制御 | | | ○/× | |
| TC-AUTH-005 | ユーザー情報取得 API | | | ○/× | |
| TC-AUTH-006 | ユーザー登録 API | | | ○/× | |
| TC-POST-001 | 投稿一覧取得 | | | ○/× | |
| TC-POST-002 | ページネーション | | | ○/× | |
| TC-POST-003 | 投稿詳細取得 | | | ○/× | |
| TC-POST-004 | 存在しない投稿取得 | | | ○/× | |
| TC-POST-005 | 投稿作成 | | | ○/× | |
| TC-POST-006 | 自分の投稿削除 | | | ○/× | |
| TC-POST-007 | 他人の投稿削除 | | | ○/× | |
| TC-POST-008 | 画面での投稿操作 | | | ○/× | |
| TC-LIKE-001 | いいね追加 | | | ○/× | |
| TC-LIKE-002 | いいねトグル | | | ○/× | |
| TC-LIKE-003 | 重複いいね防止 | | | ○/× | |
| TC-LIKE-004 | 画面でのいいね動作 | | | ○/× | |
| TC-COMMENT-001 | コメント一覧取得 | | | ○/× | |
| TC-COMMENT-002 | 存在しない投稿のコメント | | | ○/× | |
| TC-COMMENT-003 | コメント追加 | | | ○/× | |
| TC-COMMENT-004 | コメント画面遷移 | | | ○/× | |
| TC-COMMENT-005 | 画面でのコメント投稿 | | | ○/× | |
| TC-VAL-001 | ユーザーネーム20文字超え | | | ○/× | |
| TC-VAL-002 | メールアドレス重複 | | | ○/× | |
| TC-VAL-003 | 投稿内容必須チェック | | | ○/× | |
| TC-VAL-004 | 投稿120文字超え | | | ○/× | |
| TC-VAL-005 | コメント120文字超え | | | ○/× | |
| TC-ERR-002	 | フロントエンドバリデーション | | | ○/× | |
| TC-AUTHZ-001 | 未認証での投稿削除 | | | ○/× | |
| TC-AUTHZ-002 | 他人の投稿削除（認可エラー） | | | ○/× | |
| TC-AUTHZ-003 | 未認証でのいいね | | | ○/× | |
| TC-AUTHZ-004 | 未認証でのコメント投稿 | | | ○/× | |
| TC-UI-001 | 投稿一覧画面 | | | ○/× | |
| TC-UI-002 | ログイン画面 | | | ○/× | |
| TC-UI-003 | 新規登録画面 | | | ○/× | |
| TC-UI-004 | コメント画面 | | | ○/× | |
| TC-UI-005 | サイドバー表示 | | | ○/× | |
| TC-ERR-001 | 無効トークン | | | ○/× | |
| TC-ERR-002 | 不正 JSON | | | ○/× | |
| TC-ERR-003 | ネットワークエラー | | | ○/× | |
| TC-ERR-004 | PHPUnit 全テスト | | | ○/× | |
