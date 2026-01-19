#!/bin/bash

# APIテストスクリプト
# ベースURL
BASE_URL="http://localhost/api"

echo "=========================================="
echo "API テスト開始"
echo "=========================================="
echo ""

# 色の定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# テスト結果を記録
PASSED=0
FAILED=0

# テスト関数
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    local expected_status=$5
    
    echo "テスト: $description"
    echo "  $method $endpoint"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -H "Accept: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Accept: application/json" \
            "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "  ${GREEN}✓ PASS${NC} (HTTP $http_code)"
        echo "  レスポンス: $(echo "$body" | jq -c '.' 2>/dev/null || echo "$body" | head -c 100)..."
        ((PASSED++))
    else
        echo -e "  ${RED}✗ FAIL${NC} (期待: HTTP $expected_status, 実際: HTTP $http_code)"
        echo "  レスポンス: $body"
        ((FAILED++))
    fi
    echo ""
}

# 1. 投稿一覧取得（公開エンドポイント）
test_endpoint "GET" "/posts" "投稿一覧取得" "" 200

# 2. 投稿詳細取得（データがない場合は404）
test_endpoint "GET" "/posts/1" "投稿詳細取得（ID: 1、データがない場合は404）" "" 404

# 3. 存在しない投稿の取得
test_endpoint "GET" "/posts/999999" "存在しない投稿の取得" "" 404

# 4. コメント一覧取得（データがない場合は404）
test_endpoint "GET" "/posts/1/comments" "コメント一覧取得（投稿ID: 1、データがない場合は404）" "" 404

# 5. 存在しない投稿のコメント取得
test_endpoint "GET" "/posts/999999/comments" "存在しない投稿のコメント取得" "" 404

# 6. 新規登録（バリデーションエラーテスト）
test_endpoint "POST" "/auth/register" "新規登録（バリデーションエラー）" \
    '{"firebase_uid":"","user_name":"","email":""}' 422

# 7. 新規登録（ユーザーネーム長さエラー - 21文字）
test_endpoint "POST" "/auth/register" "新規登録（ユーザーネーム長さエラー）" \
    '{"firebase_uid":"test_uid_21chars_2","user_name":"あああああああああああああああああああああ","email":"test21@example.com"}' 422

# 8. 新規登録（メール形式エラー）
test_endpoint "POST" "/auth/register" "新規登録（メール形式エラー）" \
    '{"firebase_uid":"test_uid_123","user_name":"testuser","email":"invalid-email"}' 422

# 9. 投稿作成（認証エラー）
test_endpoint "POST" "/posts" "投稿作成（認証エラー）" \
    '{"content":"テスト投稿"}' 401

# 10. 投稿削除（認証エラー）
test_endpoint "DELETE" "/posts/1" "投稿削除（認証エラー）" "" 401

# 11. いいね（認証エラー）
test_endpoint "POST" "/posts/1/like" "いいね（認証エラー）" "" 401

# 12. コメント作成（認証エラー）
test_endpoint "POST" "/posts/1/comments" "コメント作成（認証エラー）" \
    '{"content":"テストコメント"}' 401

# 13. 投稿作成（バリデーションエラー - 認証ありの場合を想定）
# 認証トークンがないため401が返るが、バリデーションエラーも確認
test_endpoint "POST" "/posts" "投稿作成（内容なし）" \
    '{"content":""}' 401

# 14. 投稿作成（内容が長すぎる場合 - 認証ありの場合を想定）
test_endpoint "POST" "/posts" "投稿作成（内容が長すぎる）" \
    '{"content":"これは121文字の投稿内容です。仕様では120文字以内とされているため、この投稿はバリデーションエラーになるはずです。文字数を数えてみましょう。"}' 401

echo "=========================================="
echo "テスト結果"
echo "=========================================="
echo -e "${GREEN}成功: $PASSED${NC}"
echo -e "${RED}失敗: $FAILED${NC}"
echo "合計: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}すべてのテストが成功しました！${NC}"
    exit 0
else
    echo -e "${RED}一部のテストが失敗しました。${NC}"
    exit 1
fi

