<?php

namespace Tests\Feature;

use App\Models\Like;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class LikeControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Firebase認証を無効化してテストを実行
        Config::set('firebase.auth_disabled', true);
    }

    /**
     * いいねを追加できることを確認
     *
     * @return void
     */
    public function test_toggle_like_add_success()
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

        $response = $this->postJson("/api/posts/{$post->id}/like");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'post_id' => $post->id,
                    'is_liked' => true,
                    'likes_count' => 1,
                ],
            ]);

        $this->assertDatabaseHas('likes', [
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);
    }

    /**
     * いいねを削除できることを確認（トグル機能）
     *
     * @return void
     */
    public function test_toggle_like_remove_success()
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

        Like::create([
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);

        $this->actingAs($user);

        $response = $this->postJson("/api/posts/{$post->id}/like");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'post_id' => $post->id,
                    'is_liked' => false,
                    'likes_count' => 0,
                ],
            ]);

        $this->assertDatabaseMissing('likes', [
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);
    }

    /**
     * 複数ユーザーがいいねした場合のいいね数が正しいことを確認
     *
     * @return void
     */
    public function test_toggle_like_multiple_users()
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
            'content' => 'テスト投稿',
        ]);

        // ユーザー1がいいね
        $this->actingAs($user1);
        $response1 = $this->postJson("/api/posts/{$post->id}/like");
        $response1->assertStatus(200)
            ->assertJson([
                'data' => [
                    'is_liked' => true,
                    'likes_count' => 1,
                ],
            ]);

        // ユーザー2がいいね
        $this->actingAs($user2);
        $response2 = $this->postJson("/api/posts/{$post->id}/like");
        $response2->assertStatus(200)
            ->assertJson([
                'data' => [
                    'is_liked' => true,
                    'likes_count' => 2,
                ],
            ]);

        // ユーザー1がいいねを解除
        $this->actingAs($user1);
        $response3 = $this->postJson("/api/posts/{$post->id}/like");
        $response3->assertStatus(200)
            ->assertJson([
                'data' => [
                    'is_liked' => false,
                    'likes_count' => 1,
                ],
            ]);
    }

    /**
     * 認証なしでいいねできないことを確認
     *
     * @return void
     */
    public function test_toggle_like_unauthorized()
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

        $response = $this->postJson("/api/posts/{$post->id}/like");

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * 存在しない投稿にいいねしようとした場合、404を返すことを確認
     *
     * @return void
     */
    public function test_toggle_like_not_found()
    {
        $user = User::create([
            'firebase_uid' => 'test-firebase-uid-1',
            'user_name' => 'testuser1',
            'email' => 'test1@example.com',
            'password' => 'dummy-password',
        ]);

        $this->actingAs($user);

        $response = $this->postJson('/api/posts/999/like');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => '投稿が見つかりません',
            ]);
    }
}

