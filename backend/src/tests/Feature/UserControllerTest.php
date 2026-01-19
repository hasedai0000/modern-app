<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Firebase認証を無効化してテストを実行
        Config::set('firebase.auth_disabled', true);
    }

    /**
     * 現在のログインユーザー情報を取得できることを確認
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

        $this->actingAs($user);

        $response = $this->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'firebase_uid' => 'test-firebase-uid-1',
                    'user_name' => 'testuser1',
                    'email' => 'test1@example.com',
                ],
            ]);
    }

    /**
     * 認証なしでユーザー情報を取得できないことを確認
     * 注: Firebase認証が無効化されている場合、Auth::user()はnullを返すため404が返される
     *
     * @return void
     */
    public function test_show_unauthorized()
    {
        $response = $this->getJson('/api/user');

        // Firebase認証が無効化されている場合、Auth::user()はnullを返すため404が返される
        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'ユーザーが見つかりません',
            ]);
    }
}

