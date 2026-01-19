<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class PostControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Firebase認証を無効化してテストを実行
        Config::set('firebase.auth_disabled', true);
    }

    /**
     * 投稿一覧を取得できることを確認
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

        Post::create([
            'user_id' => $user->id,
            'content' => 'テスト投稿1',
        ]);

        Post::create([
            'user_id' => $user->id,
            'content' => 'テスト投稿2',
        ]);

        $response = $this->getJson('/api/posts');

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
                        'content',
                        'likes_count',
                        'comments_count',
                        'created_at',
                    ],
                ],
                'pagination' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ]);
    }

    /**
     * 投稿一覧が作成日時の降順で取得されることを確認
     *
     * @return void
     */
    public function test_index_ordered_by_created_at_desc()
    {
        $user = User::create([
            'firebase_uid' => 'test-firebase-uid-1',
            'user_name' => 'testuser1',
            'email' => 'test1@example.com',
            'password' => 'dummy-password',
        ]);

        $post1 = Post::create([
            'user_id' => $user->id,
            'content' => '最初の投稿',
        ]);
        $post1->created_at = now()->subDays(2);
        $post1->save();

        $post2 = Post::create([
            'user_id' => $user->id,
            'content' => '最新の投稿',
        ]);
        $post2->created_at = now();
        $post2->save();

        $response = $this->getJson('/api/posts');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertEquals('最新の投稿', $data[0]['content']);
        $this->assertEquals('最初の投稿', $data[1]['content']);
    }

    /**
     * 投稿を作成できることを確認
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

        $this->actingAs($user);

        $data = [
            'content' => '新しい投稿',
        ];

        $response = $this->postJson('/api/posts', $data);

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
                    'content',
                    'likes_count',
                    'comments_count',
                    'created_at',
                ],
            ]);

        $this->assertDatabaseHas('posts', [
            'user_id' => $user->id,
            'content' => '新しい投稿',
        ]);
    }

    /**
     * 認証なしで投稿を作成できないことを確認
     *
     * @return void
     */
    public function test_store_unauthorized()
    {
        $data = [
            'content' => '新しい投稿',
        ];

        $response = $this->postJson('/api/posts', $data);

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

        $this->actingAs($user);

        $response = $this->postJson('/api/posts', []);

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

        $this->actingAs($user);

        $data = [
            'content' => str_repeat('a', 121), // 121文字
        ];

        $response = $this->postJson('/api/posts', $data);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'バリデーションエラー',
            ])
            ->assertJsonValidationErrors(['content']);
    }

    /**
     * 投稿詳細を取得できることを確認
     *
     * @return void
     */
    public function test_show_success()
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

        $response = $this->getJson("/api/posts/{$post->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $post->id,
                    'user_id' => $user->id,
                    'user_name' => 'testuser1',
                    'content' => 'テスト投稿',
                ],
            ]);
    }

    /**
     * 存在しない投稿を取得しようとした場合、404を返すことを確認
     *
     * @return void
     */
    public function test_show_not_found()
    {
        $response = $this->getJson('/api/posts/999');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => '投稿が見つかりません',
            ]);
    }

    /**
     * 投稿を削除できることを確認（投稿者の場合）
     *
     * @return void
     */
    public function test_destroy_success()
    {
        $user = User::create([
            'firebase_uid' => 'test-firebase-uid-1',
            'user_name' => 'testuser1',
            'email' => 'test1@example.com',
            'password' => 'dummy-password',
        ]);

        $post = Post::create([
            'user_id' => $user->id,
            'content' => '削除する投稿',
        ]);

        $this->actingAs($user);

        $response = $this->deleteJson("/api/posts/{$post->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseMissing('posts', [
            'id' => $post->id,
        ]);
    }

    /**
     * 認証なしで投稿を削除できないことを確認
     *
     * @return void
     */
    public function test_destroy_unauthorized()
    {
        $user = User::create([
            'firebase_uid' => 'test-firebase-uid-1',
            'user_name' => 'testuser1',
            'email' => 'test1@example.com',
            'password' => 'dummy-password',
        ]);

        $post = Post::create([
            'user_id' => $user->id,
            'content' => '削除する投稿',
        ]);

        $response = $this->deleteJson("/api/posts/{$post->id}");

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * 他人の投稿を削除できないことを確認
     *
     * @return void
     */
    public function test_destroy_forbidden()
    {
        $user1 = User::create([
            'firebase_uid' => 'test-firebase-uid-1',
            'user_name' => 'testuser1',
            'email' => 'test1@example.com',
            'password' => 'dummy-password',
        ]);

        $user2 = User::create([
            'firebase_uid' => 'test-firebase-uid-2',
            'user_name' => 'testuser2',
            'email' => 'test2@example.com',
            'password' => 'dummy-password',
        ]);

        $post = Post::create([
            'user_id' => $user1->id,
            'content' => '他人の投稿',
        ]);

        $this->actingAs($user2);

        $response = $this->deleteJson("/api/posts/{$post->id}");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'この投稿を削除する権限がありません',
            ]);

        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
        ]);
    }

    /**
     * 存在しない投稿を削除しようとした場合、404を返すことを確認
     *
     * @return void
     */
    public function test_destroy_not_found()
    {
        $user = User::create([
            'firebase_uid' => 'test-firebase-uid-1',
            'user_name' => 'testuser1',
            'email' => 'test1@example.com',
            'password' => 'dummy-password',
        ]);

        $this->actingAs($user);

        $response = $this->deleteJson('/api/posts/999');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => '投稿が見つかりません',
            ]);
    }
}

