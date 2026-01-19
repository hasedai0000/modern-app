<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IndexPostRequest extends FormRequest
{
  /**
   * リクエストの認証を許可するかどうか
   *
   * @return bool
   */
  public function authorize(): bool
  {
    return true;
  }

  /**
   * バリデーションルール
   *
   * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
   */
  public function rules(): array
  {
    return [
      'per_page' => 'nullable|integer|min:1|max:100',
    ];
  }

  /**
   * バリデーションエラーメッセージ
   *
   * @return array<string, string>
   */
  public function messages(): array
  {
    return [
      'per_page.integer' => 'per_pageは整数で入力してください',
      'per_page.min' => 'per_pageは1以上で入力してください',
      'per_page.max' => 'per_pageは100以下で入力してください',
    ];
  }

  /**
   * バリデーション後のデータ準備
   *
   * @return void
   */
  protected function prepareForValidation(): void
  {
    // per_pageが指定されていない場合はデフォルト値15を設定
    if (!$this->has('per_page')) {
      $this->merge(['per_page' => 15]);
    }
  }
}
