<?php

namespace Tests\Unit;

use App\Http\Requests\RegisterRequest;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Support\Facades\Validator;
use Tests\CreatesApplication;

class RegisterRequestTest extends TestCase
{
  use CreatesApplication;

  /**
   * バリデーションルールのテスト
   *
   * @return void
   */
  public function test_validation_rules()
  {
    $request = new RegisterRequest();
    $rules = $request->rules();

    $this->assertArrayHasKey('firebase_uid', $rules);
    $this->assertArrayHasKey('user_name', $rules);
    $this->assertArrayHasKey('email', $rules);
    $this->assertStringContainsString('required', $rules['firebase_uid']);
    $this->assertStringContainsString('required', $rules['user_name']);
    $this->assertStringContainsString('max:20', $rules['user_name']);
    $this->assertStringContainsString('required', $rules['email']);
    $this->assertStringContainsString('email', $rules['email']);
  }

  /**
   * uniqueルールを除外したルール配列を取得
   *
   * @return array<string, string>
   */
  private function getRulesWithoutUnique(): array
  {
    $rules = (new RegisterRequest())->rules();
    foreach ($rules as $key => $rule) {
      if (is_string($rule)) {
        $rule_parts = explode('|', $rule);
        $rule_parts = array_filter($rule_parts, function ($part) {
          $trimmed = trim($part);
          return strpos($trimmed, 'unique:') !== 0;
        });
        $rules[$key] = implode('|', $rule_parts);
      }
    }
    return $rules;
  }

  /**
   * 正常なデータでバリデーションが通ることを確認
   * 注: uniqueルールはデータベース接続が必要なため、Unitテストでは除外
   *
   * @return void
   */
  public function test_validation_passes_with_valid_data()
  {
    $data = [
      'firebase_uid' => 'test-firebase-uid-123',
      'user_name' => 'testuser',
      'email' => 'test@example.com',
    ];

    $validator = Validator::make($data, $this->getRulesWithoutUnique());
    $this->assertFalse($validator->fails());
  }

  /**
   * firebase_uidが必須であることを確認
   *
   * @return void
   */
  public function test_validation_fails_when_firebase_uid_is_missing()
  {
    $data = [
      'user_name' => 'testuser',
      'email' => 'test@example.com',
    ];

    $validator = Validator::make($data, (new RegisterRequest())->rules());
    $this->assertTrue($validator->fails());
    $this->assertTrue($validator->errors()->has('firebase_uid'));
  }

  /**
   * user_nameが必須であることを確認
   * 注: uniqueルールはデータベース接続が必要なため、Unitテストでは除外
   *
   * @return void
   */
  public function test_validation_fails_when_user_name_is_missing()
  {
    $data = [
      'firebase_uid' => 'test-firebase-uid-123',
      'email' => 'test@example.com',
    ];

    $validator = Validator::make($data, $this->getRulesWithoutUnique());
    $this->assertTrue($validator->fails());
    $this->assertTrue($validator->errors()->has('user_name'));
  }

  /**
   * user_nameが20文字以内であることを確認
   * 注: uniqueルールはデータベース接続が必要なため、Unitテストでは除外
   *
   * @return void
   */
  public function test_validation_fails_when_user_name_exceeds_20_characters()
  {
    $data = [
      'firebase_uid' => 'test-firebase-uid-123',
      'user_name' => str_repeat('a', 21), // 21文字
      'email' => 'test@example.com',
    ];

    $validator = Validator::make($data, $this->getRulesWithoutUnique());
    $this->assertTrue($validator->fails());
    $this->assertTrue($validator->errors()->has('user_name'));
  }

  /**
   * user_nameが20文字ちょうどで通ることを確認
   * 注: uniqueルールはデータベース接続が必要なため、Unitテストでは除外
   *
   * @return void
   */
  public function test_validation_passes_when_user_name_is_exactly_20_characters()
  {
    $data = [
      'firebase_uid' => 'test-firebase-uid-123',
      'user_name' => str_repeat('a', 20), // 20文字
      'email' => 'test@example.com',
    ];

    $validator = Validator::make($data, $this->getRulesWithoutUnique());
    $this->assertFalse($validator->fails());
  }

  /**
   * emailが必須であることを確認
   * 注: uniqueルールはデータベース接続が必要なため、Unitテストでは除外
   *
   * @return void
   */
  public function test_validation_fails_when_email_is_missing()
  {
    $data = [
      'firebase_uid' => 'test-firebase-uid-123',
      'user_name' => 'testuser',
    ];

    $validator = Validator::make($data, $this->getRulesWithoutUnique());
    $this->assertTrue($validator->fails());
    $this->assertTrue($validator->errors()->has('email'));
  }

  /**
   * emailが有効なメール形式であることを確認
   * 注: uniqueルールはデータベース接続が必要なため、Unitテストでは除外
   *
   * @return void
   */
  public function test_validation_fails_when_email_is_invalid_format()
  {
    $data = [
      'firebase_uid' => 'test-firebase-uid-123',
      'user_name' => 'testuser',
      'email' => 'invalid-email',
    ];

    $validator = Validator::make($data, $this->getRulesWithoutUnique());
    $this->assertTrue($validator->fails());
    $this->assertTrue($validator->errors()->has('email'));
  }

  /**
   * バリデーションメッセージが正しく設定されていることを確認
   *
   * @return void
   */
  public function test_validation_messages()
  {
    $request = new RegisterRequest();
    $messages = $request->messages();

    $this->assertArrayHasKey('firebase_uid.required', $messages);
    $this->assertArrayHasKey('firebase_uid.unique', $messages);
    $this->assertArrayHasKey('user_name.required', $messages);
    $this->assertArrayHasKey('user_name.max', $messages);
    $this->assertArrayHasKey('email.required', $messages);
    $this->assertArrayHasKey('email.email', $messages);
    $this->assertArrayHasKey('email.unique', $messages);
  }

  /**
   * authorizeメソッドがtrueを返すことを確認
   *
   * @return void
   */
  public function test_authorize_returns_true()
  {
    $request = new RegisterRequest();
    $this->assertTrue($request->authorize());
  }
}
