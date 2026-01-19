<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Like\Repositories\LikeRepositoryInterface;
use App\Models\Like;
use App\Models\Post;
use Illuminate\Support\Facades\DB;

class EloquentLikeRepository implements LikeRepositoryInterface
{
  public function toggle(int $user_id, int $post_id): array
  {
    return DB::transaction(function () use ($user_id, $post_id) {
      $existing_like = Like::query()
        ->where('user_id', $user_id)
        ->where('post_id', $post_id)
        ->first();

      $liked = false;

      if ($existing_like !== null) {
        $existing_like->delete();
        $liked = false;
      } else {
        $like = new Like();
        $like->user_id = $user_id;
        $like->post_id = $post_id;
        $like->save();
        $liked = true;
      }

      $likes_count = Post::query()
        ->withCount('likes')
        ->where('id', $post_id)
        ->value('likes_count');

      return [
        'liked' => $liked,
        'likes_count' => (int) ($likes_count ?? 0),
      ];
    });
  }
}
