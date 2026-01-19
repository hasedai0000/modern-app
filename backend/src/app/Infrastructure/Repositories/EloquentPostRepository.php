<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Post\Repositories\PostRepositoryInterface;
use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentPostRepository implements PostRepositoryInterface
{
  public function paginate(int $page, int $per_page): LengthAwarePaginator
  {
    return Post::query()
      ->with(['user'])
      ->withCounts()
      ->orderByDesc('created_at')
      ->paginate($per_page, ['*'], 'page', $page);
  }

  public function findById(int $post_id): ?Post
  {
    return Post::query()
      ->with(['user'])
      ->withCounts()
      ->where('id', $post_id)
      ->first();
  }

  public function save(int $user_id, string $content): Post
  {
    $post = new Post();
    $post->user_id = $user_id;
    $post->content = $content;
    $post->save();

    return $post->load('user')->loadCount(['likes', 'comments']);
  }

  public function deleteById(int $post_id): bool
  {
    return (bool) Post::query()->where('id', $post_id)->delete();
  }
}
