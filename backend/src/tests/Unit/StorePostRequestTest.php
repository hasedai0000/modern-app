<?php

namespace Tests\Unit;

use App\Http\Requests\StorePostRequest;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Support\Facades\Validator;
use Tests\CreatesApplication;

class StorePostRequestTest extends TestCase
{
    use CreatesApplication;

    /**
     * バリデーションルールのテスト
     *
     * @return void
     */
    public function test_validation_rules()
    {
        $request = new StorePostRequest();
        $rules = $request->rules();

        $this->assertArrayHasKey('content', $rules);
        $this->assertStringContainsString('required', $rules['content']);
        $this->assertStringContainsString('string', $rules['content']);
        $this->assertStringContainsString('max:120', $rules['content']);
    }

    /**
     * 正常なデータでバリデーションが通ることを確認
     *
     * @return void
     */
    public function test_validation_passes_with_valid_data()
    {
        $data = [
            'content' => 'これはテスト投稿です',
        ];

        $validator = Validator::make($data, (new StorePostRequest())->rules());
        $this->assertFalse($validator->fails());
    }

    /**
     * contentが必須であることを確認
     *
     * @return void
     */
    public function test_validation_fails_when_content_is_missing()
    {
        $data = [];

        $validator = Validator::make($data, (new StorePostRequest())->rules());
        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('content'));
    }

    /**
     * contentが120文字以内であることを確認
     *
     * @return void
     */
    public function test_validation_fails_when_content_exceeds_120_characters()
    {
        $data = [
            'content' => str_repeat('a', 121), // 121文字
        ];

        $validator = Validator::make($data, (new StorePostRequest())->rules());
        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('content'));
    }

    /**
     * contentが120文字ちょうどで通ることを確認
     *
     * @return void
     */
    public function test_validation_passes_when_content_is_exactly_120_characters()
    {
        $data = [
            'content' => str_repeat('a', 120), // 120文字
        ];

        $validator = Validator::make($data, (new StorePostRequest())->rules());
        $this->assertFalse($validator->fails());
    }

    /**
     * contentが空文字列で失敗することを確認
     *
     * @return void
     */
    public function test_validation_fails_when_content_is_empty_string()
    {
        $data = [
            'content' => '',
        ];

        $validator = Validator::make($data, (new StorePostRequest())->rules());
        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('content'));
    }

    /**
     * バリデーションメッセージが正しく設定されていることを確認
     *
     * @return void
     */
    public function test_validation_messages()
    {
        $request = new StorePostRequest();
        $messages = $request->messages();

        $this->assertArrayHasKey('content.required', $messages);
        $this->assertArrayHasKey('content.string', $messages);
        $this->assertArrayHasKey('content.max', $messages);
    }

    /**
     * authorizeメソッドがtrueを返すことを確認
     *
     * @return void
     */
    public function test_authorize_returns_true()
    {
        $request = new StorePostRequest();
        $this->assertTrue($request->authorize());
    }
}

