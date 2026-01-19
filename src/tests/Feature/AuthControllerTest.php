<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * ユーザー登録が成功することを確認
     *
     * @return void
     */
    public function test_register_success()
    {
        $data = [
            'firebase_uid' => 'test-firebase-uid-123',
            'user_name' => 'testuser',
            'email' => 'test@example.com',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'firebase_uid',
                    'user_name',
                    'email',
                    'created_at',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'firebase_uid' => 'test-firebase-uid-123',
            'user_name' => 'testuser',
            'email' => 'test@example.com',
        ]);
    }

    /**
     * バリデーションエラーが発生することを確認（firebase_uidが未指定）
     *
     * @return void
     */
    public function test_register_validation_error_firebase_uid_missing()
    {
        $data = [
            'user_name' => 'testuser',
            'email' => 'test@example.com',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'バリデーションエラー',
            ])
            ->assertJsonValidationErrors(['firebase_uid']);
    }

    /**
     * バリデーションエラーが発生することを確認（user_nameが未指定）
     *
     * @return void
     */
    public function test_register_validation_error_user_name_missing()
    {
        $data = [
            'firebase_uid' => 'test-firebase-uid-123',
            'email' => 'test@example.com',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'バリデーションエラー',
            ])
            ->assertJsonValidationErrors(['user_name']);
    }

    /**
     * バリデーションエラーが発生することを確認（user_nameが20文字超過）
     *
     * @return void
     */
    public function test_register_validation_error_user_name_exceeds_20_characters()
    {
        $data = [
            'firebase_uid' => 'test-firebase-uid-123',
            'user_name' => str_repeat('a', 21), // 21文字
            'email' => 'test@example.com',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'バリデーションエラー',
            ])
            ->assertJsonValidationErrors(['user_name']);
    }

    /**
     * バリデーションエラーが発生することを確認（emailが未指定）
     *
     * @return void
     */
    public function test_register_validation_error_email_missing()
    {
        $data = [
            'firebase_uid' => 'test-firebase-uid-123',
            'user_name' => 'testuser',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'バリデーションエラー',
            ])
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * バリデーションエラーが発生することを確認（emailが無効な形式）
     *
     * @return void
     */
    public function test_register_validation_error_email_invalid_format()
    {
        $data = [
            'firebase_uid' => 'test-firebase-uid-123',
            'user_name' => 'testuser',
            'email' => 'invalid-email',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'バリデーションエラー',
            ])
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * 重複したfirebase_uidで登録できないことを確認
     *
     * @return void
     */
    public function test_register_validation_error_duplicate_firebase_uid()
    {
        User::create([
            'firebase_uid' => 'test-firebase-uid-123',
            'user_name' => 'existinguser',
            'email' => 'existing@example.com',
            'password' => 'dummy-password',
        ]);

        $data = [
            'firebase_uid' => 'test-firebase-uid-123',
            'user_name' => 'testuser',
            'email' => 'test@example.com',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'バリデーションエラー',
            ])
            ->assertJsonValidationErrors(['firebase_uid']);
    }

    /**
     * 重複したemailで登録できないことを確認
     *
     * @return void
     */
    public function test_register_validation_error_duplicate_email()
    {
        User::create([
            'firebase_uid' => 'existing-firebase-uid',
            'user_name' => 'existinguser',
            'email' => 'test@example.com',
            'password' => 'dummy-password',
        ]);

        $data = [
            'firebase_uid' => 'test-firebase-uid-123',
            'user_name' => 'testuser',
            'email' => 'test@example.com',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'バリデーションエラー',
            ])
            ->assertJsonValidationErrors(['email']);
    }
}

