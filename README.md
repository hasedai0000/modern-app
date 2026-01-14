# Twitter 風 SNS アプリ

## プロジェクトの概要

何気ないことをつぶやくことができる Twitter 風 SNS アプリケーションです。ユーザーが投稿を作成し、他のユーザーの投稿にいいねやコメントを付けることができるプラットフォームを提供します。

### 主な機能

- **ユーザー認証・管理**

  - Firebase Authentication による新規登録・ログイン・ログアウト
  - ユーザー情報の管理

- **投稿機能**

  - 投稿の作成・削除
  - 投稿一覧の表示（ユーザー名、投稿内容、投稿日時、いいね数、コメント数）
  - 投稿詳細の表示
  - ページネーション対応

- **いいね機能**

  - 投稿へのいいね追加/削除（トグル機能）
  - いいね数のリアルタイム表示

- **コメント機能**

  - 投稿へのコメント追加
  - コメント一覧の表示（ユーザー名、コメント内容、コメント日時）

- **その他**
  - レスポンシブデザイン対応
  - バリデーション機能
  - CI/CD (GitHub Actions)

## 使用技術

### フロントエンド

- **Next.js** 15.x
- **TypeScript**
- **Firebase Authentication** (認証機能)

### バックエンド

- **PHP** 7.3|8.0
- **Laravel** 8.x
- **MySQL** 8.0.26

### 認証

- **Firebase Authentication** (メールアドレスとパスワードによる認証)

### 開発・運用環境

- **Docker** & **Docker Compose**
- **Nginx** 1.21.1
- **PHPMyAdmin** (データベース管理)
- **MailHog** (メール送信テスト)

### 開発ツール

- **PHPStan** (静的解析)
- **PHP CodeSniffer** (コード規約チェック)
- **PHP CS Fixer** (コード整形)
- **PHPUnit** (テスト)

## 環境構築手順

### 前提条件

以下のソフトウェアがインストールされていることを確認してください：

- Docker Desktop
- Docker Compose

### 1. リポジトリのクローン

```bash
# SSHでクローンする場合
git clone git@github.com:hasedai0000/furima-app.git

# HTTPSでクローンする場合
git clone https://github.com/hasedai0000/furima-app.git

cd furima-app
```

### 2. 環境の起動

```bash
# Dockerコンテナをビルドして起動
docker compose up -d --build
```

### 3. Laravel アプリケーションのセットアップ

```bash
# PHPコンテナに入る
docker compose exec php bash

# 依存関係のインストール
composer install

# 環境設定ファイルのコピー
cp .env.example .env

# アプリケーションキーの生成
php artisan key:generate

# 画像保存のためシンボリックリンクを作成する
php artisan storage:link

# データベースマイグレーションとシーダーの実行
php artisan migrate:fresh --seed

```

#### 3.1 データベース接続情報

```bash

# .envにDB接続情報の設定
DB_DATABASE=laravel_db
DB_USERNAME=laravel_user
DB_PASSWORD=laravel_pass
DB_HOST=mysql #（コンテナ間通信）

# データベースマイグレーションとシーダーの実行
php artisan migrate:fresh --seed

```

### 4. 動作確認

ブラウザで以下の URL にアクセスして、アプリケーションが正常に動作することを確認してください：

- **アプリケーション**: <http://localhost>
- **PHPMyAdmin**: <http://localhost:8080>
- **MailHog**: <http://localhost:8025>

### 5. 2 回目以降の起動

```bash
docker compose up -d
```

## API エンドポイント

### 認証関連

- **POST /api/auth/register**: Firebase 認証後にユーザー情報を Laravel DB に登録

### ユーザー関連

- **GET /api/user**: 現在のログインユーザー情報を取得（認証必須）

### 投稿関連

- **GET /api/posts**: 投稿一覧を取得（ページネーション対応）
- **POST /api/posts**: 新しい投稿を追加（認証必須、120 文字以内）
- **GET /api/posts/{id}**: 指定された投稿を取得
- **DELETE /api/posts/{id}**: 投稿を削除（認証必須、投稿者のみ）

### いいね関連

- **POST /api/posts/{id}/like**: いいねの追加/削除を切り替える（認証必須、トグル機能）

### コメント関連

- **GET /api/posts/{id}/comments**: 指定された投稿のコメント一覧を取得
- **POST /api/posts/{id}/comments**: 指定された投稿にコメントを追加（認証必須、120 文字以内）

詳細な API 仕様については `.cursor/api_endpoints.mdc` を参照してください。

## Firebase Authentication の設定

### 設定手順

1. Firebase プロジェクトを作成
2. Authentication を有効化（メール/パスワード認証）
3. Firebase 設定情報を Next.js アプリに設定
4. Laravel 側で Firebase トークンを検証するミドルウェアを実装

## 開発時の操作

### コンテナの操作

```bash
# コンテナを停止
docker compose stop

# コンテナを停止して削除
docker compose down

# コンテナを再起動
docker compose restart
```

### ログの確認

```bash
# 全サービスのログを確認
docker compose logs

# 特定のサービスのログを確認
docker compose logs nginx
docker compose logs php
docker compose logs mysql
```

### コンテナ内での作業

```bash
# PHPコンテナに入る
docker compose exec php bash

# Nginxコンテナに入る
docker compose exec nginx bash

# MySQLコンテナに入る
docker compose exec mysql bash
```

### MySQL への直接アクセス

```bash
# MySQLコンテナ内でMySQLにログイン
docker compose exec mysql mysql -u laravel_user -p laravel_db
# パスワード: laravel_pass
```

### 開発用コマンド

```bash
# PHPコンテナ内で実行

# マイグレーションの実行
php artisan migrate

# シーダーの実行
php artisan db:seed

# テストの実行
docker compose exec php php artisan test
```

## CI/CD

このプロジェクトでは GitHub Actions を使用して CI/CD パイプラインを構築しています。

### 自動テスト

プッシュ・プルリクエスト時に以下が自動実行されます：

- **テスト実行**: PHPUnit を使用したユニットテスト・フィーチャーテスト

### マトリックステスト

複数の PHP バージョンでテストを実行：

- PHP 8.0

### ワークフロー

CI 設定ファイル: `.github/workflows/ci.yml`

```bash
# ローカルで同じテストを実行する場合
cd src
composer test      # PHPUnit テストを実行
```

## 設計書

プロジェクトの詳細な設計情報は `.cursor/` ディレクトリ配下にあります：

- **`.cursorrules`**: コーディングルール（命名規則、ディレクトリ構造）
- **`twitter-sns-rules.mdc`**: プロジェクト仕様（機能要件、UI/UX 要件、セキュリティ要件等）
- **`api_endpoints.mdc`**: API エンドポイント設計書
- **`controller_design.mdc`**: Controller クラス設計書
- **`database_design.mdc`**: データベース設計書
- **`model_design.mdc`**: Model クラス設計書

## ファイル構成

```text
modern-app/
├── docker/                 # Docker設定
│   ├── nginx/
│   │   └── default.conf    # Nginx設定
│   ├── php/
│   │   ├── Dockerfile      # PHP設定
│   │   └── php.ini         # PHP設定
│   └── mysql/
│       └── my.cnf          # MySQL設定
├── src/                    # Laravelアプリケーション
│   ├── app/                # アプリケーションロジック
│   │   ├── Application/    # アプリケーション層
│   │   │   └── Services/   # ユースケース実装
│   │   ├── Domain/         # ドメイン層
│   │   │   └── */         # ドメイン名
│   │   │       ├── Entities/      # エンティティ
│   │   │       ├── ValueObjects/   # 値オブジェクト
│   │   │       ├── Repositories/   # データ取得用インターフェース
│   │   │       └── Services/       # ドメイン固有のロジック
│   │   ├── Http/           # プレゼンテーション層
│   │   │   ├── Controllers/        # HTTPリクエスト処理
│   │   │   └── Requests/           # 入力検証
│   │   ├── Infrastructure/ # インフラストラクチャ層
│   │   │   └── Repositories/       # データアクセス実装
│   │   └── Models/         # Eloquentモデル
│   │       └── Repositories/       # データアクセス実装
│   ├── database/           # マイグレーション・シーダー
│   ├── public/             # 公開ファイル
│   ├── resources/          # ビュー・CSS・JS
│   └── routes/             # ルート定義
├── .cursor/                # プロジェクト仕様・設計書
│   ├── .cursorrules        # コーディングルール
│   ├── twitter-sns-rules.mdc      # プロジェクト仕様
│   ├── api_endpoints.mdc          # APIエンドポイント設計書
│   ├── controller_design.mdc     # Controllerクラス設計書
│   ├── database_design.mdc        # データベース設計書
│   └── model_design.mdc           # Modelクラス設計書
├── docker-compose.yaml     # Docker Compose設定
└── README.md              # このファイル
```

## データベース設計

### テーブル構成

- **users**: ユーザー情報（user_name, email, password 等）
- **posts**: 投稿情報（user_id, content 等）
- **likes**: いいね情報（user_id, post_id 等）
- **comments**: コメント情報（user_id, post_id, content 等）

詳細なデータベース設計については `.cursor/database_design.mdc` を参照してください。

## コーディングルール

本プロジェクトでは、以下の命名規則を厳密に遵守します：

- **モデル**: 単数形、パスカルケース（例: `Post.php`, `User.php`）
- **テーブル**: 複数形、スネークケース（例: `posts`, `users`）
- **コントローラ**: 単数形、パスカルケース（例: `PostController.php`）
- **クラス**: 単数形、パスカルケース
- **メソッド**: キャメルケース（例: `getPostById()`）
- **変数**: スネークケース（例: `$user_name`, `$post_id`）

詳細なコーディングルールについては `.cursor/.cursorrules` を参照してください。

## トラブルシューティング

### ポート競合の場合

ポート 80 が使用中の場合、`docker-compose.yml`を編集：

```yaml
services:
  nginx:
    ports:
      - "8080:80" # ホストの8080ポートを使用
```

アクセス URL: <http://localhost:8080>

### コンテナが起動しない場合

```bash
# コンテナの状態確認
docker compose ps

# ログでエラー確認
docker compose logs

# 完全にクリーンアップして再構築
docker compose down --volumes --remove-orphans
docker compose up --build
```

### データベース接続エラー

```bash
# PHPコンテナ内で接続確認
docker compose exec php php artisan tinker
DB::connection()->getPdo();
```
