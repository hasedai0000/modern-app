<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
  /**
   * ユーザー登録
   * Firebase 認証後にユーザー情報を取得し、$user に格納する
   *
   * @param RegisterRequest $request
   * @return JsonResponse
   */
  public function register(RegisterRequest $request): JsonResponse
  {
    $user = User::create([
      'firebase_uid' => $request->firebase_uid,
      'user_name' => $request->user_name,
      'email' => $request->email,
      'password' => bcrypt(''), // Firebase認証を使用するため、passwordは使用しないがDB制約のため設定
    ]);

    return $this->successResponse([
      'id' => $user->id,
      'firebase_uid' => $user->firebase_uid,
      'user_name' => $user->user_name,
      'email' => $user->email,
      'created_at' => $user->created_at,
    ], 201);
  }
}
