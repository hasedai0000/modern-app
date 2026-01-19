<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
  /**
   * 指定された投稿のいいね情報を取得し、$like に格納する
   * いいねの追加/削除を切り替え
   *
   * @param int $post_id
   * @return JsonResponse
   */
  public function toggleLike(int $post_id): JsonResponse
  {
    $post = Post::find($post_id);

    if (!$post) {
      return $this->notFoundResponse('投稿が見つかりません');
    }

    $user = Auth::user();
    if (!$user) {
      return $this->unauthorizedResponse();
    }

    $like = Like::where('user_id', $user->id)
      ->where('post_id', $post_id)
      ->first();

    if ($like) {
      // いいねが存在する場合は削除
      $like->delete();
      $is_liked = false;
    } else {
      // いいねが存在しない場合は作成
      $like = Like::create([
        'user_id' => $user->id,
        'post_id' => $post_id,
      ]);
      $is_liked = true;
    }

    // 更新後のいいね数を取得
    $likes_count = Like::where('post_id', $post_id)->count();

    return $this->successResponse([
      'post_id' => $post_id,
      'is_liked' => $is_liked,
      'likes_count' => $likes_count,
    ]);
  }
}
