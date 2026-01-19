<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class CommentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Firebase認証を無効化してテストを実行
        Config::set('firebase.auth_disabled', true);
    }

    /**
     * コメント一覧を取得できることを確認
     *
     * @return void
     */
    public function test_index_success()
    {
        $user = User::create([
            'firebase_uid' => 'test-firebase-uid-1',
            'user_name' => 'testuser1',
            'email' => 'test1@example.com',
            'password' => 'dummy-password',
        ]);

        $post = Post::create([
            'user_id' => $user->id,
            'content' => 'テスト投稿',
        ]);

        Comment::create([
            'user_id' => $user->id,
            'post_id' => $post->id,
            'content' => 'コメント1',
        ]);

        Comment::create([
            'user_id' => $user->id,
            'post_id' => $post->id,
            'content' => 'コメント2',
        ]);

        $response = $this->getJson("/api/posts/{$post->id}/comments");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'user_id',
                        'user_name',
                        'post_id',
                        'content',
                        'created_at',
                    ],
                ],
            ]);
    }

    /**
     * コメント一覧が作成日時の昇順で取得されることを確認
     *
     * @return void
     */
    public function test_index_ordered_by_created_at_asc()
    {
        $user = User::create([
            'firebase_uid' => 'test-firebase-uid-1',
            'user_name' => 'testuser1',
            'email' => 'test1@example.com',
            'password' => 'dummy-password',
        ]);

        $post = Post::create([
            'user_id' => $user->id,
            'content' => 'テスト投稿',
        ]);

        $comment1 = Comment::create([
            'user_id' => $user->id,
            'post_id' => $post->id,
            'content' => '最初のコメント',
        ]);
        $comment1->created_at = now()->subDays(1);
        $comment1->save();

        $comment2 = Comment::create([
            'user_id' => $user->id,
            'post_id' => $post->id,
            'content' => '最新のコメント',
        ]);
        $comment2->created_at = now();
        $comment2->save();

        $response = $this->getJson("/api/posts/{$post->id}/comments");

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertEquals('最初のコメント', $data[0]['content']);
        $this->assertEquals('最新のコメント', $data[1]['content']);
    }

    /**
     * 存在しない投稿のコメント一覧を取得しようとした場合、404を返すことを確認
     *
     * @return void
     */
    public function test_index_not_found()
    {
        $response = $this->getJson('/api/posts/999/comments');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => '投稿が見つかりません',
            ]);
    }

    /**
     * コメントを作成できることを確認
     *
     * @return void
     */
    public function test_store_success()
    {
        $user = User::create([
            'firebase_uid' => 'test-firebase-uid-1',
            'user_name' => 'testuser1',
            'email' => 'test1@example.com',
            'password' => 'dummy-password',
        ]);

        $post = Post::create([
            'user_id' => $user->id,
            'content' => 'テスト投稿',
        ]);

        $this->actingAs($user);

        $data = [
            'content' => '新しいコメント',
        ];

        $response = $this->postJson("/api/posts/{$post->id}/comments", $data);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'user_id',
                    'user_name',
                    'post_id',
                    'content',
                    'created_at',
                ],
            ]);

        $this->assertDatabaseHas('comments', [
            'user_id' => $user->id,
            'post_id' => $post->id,
            'content' => '新しいコメント',
        ]);
    }

    /**
     * 認証なしでコメントを作成できないことを確認
     *
     * @return void
     */
    public function test_store_unauthorized()
    {
        $user = User::create([
            'firebase_uid' => 'test-firebase-uid-1',
            'user_name' => 'testuser1',
            'email' => 'test1@example.com',
            'password' => 'dummy-password',
        ]);

        $post = Post::create([
            'user_id' => $user->id,
            'content' => 'テスト投稿',
        ]);

        $data = [
            'content' => '新しいコメント',
        ];

        $response = $this->postJson("/api/posts/{$post->id}/comments", $data);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * バリデーションエラーが発生することを確認（contentが未指定）
     *
     * @return void
     */
    public function test_store_validation_error_content_missing()
    {
        $user = User::create([
            'firebase_uid' => 'test-firebase-uid-1',
            'user_name' => 'testuser1',
            'email' => 'test1@example.com',
            'password' => 'dummy-password',
        ]);

        $post = Post::create([
            'user_id' => $user->id,
            'content' => 'テスト投稿',
        ]);

        $this->actingAs($user);

        $response = $this->postJson("/api/posts/{$post->id}/comments", []);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'バリデーションエラー',
            ])
            ->assertJsonValidationErrors(['content']);
    }

    /**
     * バリデーションエラーが発生することを確認（contentが120文字超過）
     *
     * @return void
     */
    public function test_store_validation_error_content_exceeds_120_characters()
    {
        $user = User::create([
            'firebase_uid' => 'test-firebase-uid-1',
            'user_name' => 'testuser1',
            'email' => 'test1@example.com',
            'password' => 'dummy-password',
        ]);

        $post = Post::create([
            'user_id' => $user->id,
            'content' => 'テスト投稿',
        ]);

        $this->actingAs($user);

        $data = [
            'content' => str_repeat('a', 121), // 121文字
        ];

        $response = $this->postJson("/api/posts/{$post->id}/comments", $data);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'バリデーションエラー',
            ])
            ->assertJsonValidationErrors(['content']);
    }

    /**
     * 存在しない投稿にコメントを作成しようとした場合、404を返すことを確認
     *
     * @return void
     */
    public function test_store_not_found()
    {
        $user = User::create([
            'firebase_uid' => 'test-firebase-uid-1',
            'user_name' => 'testuser1',
            'email' => 'test1@example.com',
            'password' => 'dummy-password',
        ]);

        $this->actingAs($user);

        $data = [
            'content' => '新しいコメント',
        ];

        $response = $this->postJson('/api/posts/999/comments', $data);

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => '投稿が見つかりません',
            ]);
    }
}

