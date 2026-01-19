<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
  /**
   * 現在のログインユーザー情報を取得し、$user に格納する
   *
   * @return JsonResponse
   */
  public function show(): JsonResponse
  {
    $user = Auth::user();

    if (!$user) {
      return $this->notFoundResponse('ユーザーが見つかりません');
    }

    return $this->successResponse([
      'id' => $user->id,
      'firebase_uid' => $user->firebase_uid,
      'user_name' => $user->user_name,
      'email' => $user->email,
      'created_at' => $user->created_at,
    ]);
  }
}
