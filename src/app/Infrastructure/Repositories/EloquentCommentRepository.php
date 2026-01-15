<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Comment\Repositories\CommentRepositoryInterface;
use App\Models\Comment;
use Illuminate\Support\Collection;

class EloquentCommentRepository implements CommentRepositoryInterface
{
  public function findByPostId(int $post_id): Collection
  {
    return Comment::query()
      ->with(['user'])
      ->where('post_id', $post_id)
      ->orderBy('created_at', 'asc')
      ->get();
  }

  public function save(int $user_id, int $post_id, string $content): Comment
  {
    $comment = new Comment();
    $comment->user_id = $user_id;
    $comment->post_id = $post_id;
    $comment->content = $content;
    $comment->save();

    return $comment->load('user');
  }
}
