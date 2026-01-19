<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
  /**
   * 指定された投稿のコメント一覧を取得し、$comments に格納する
   *
   * @param int $post_id
   * @return JsonResponse
   */
  public function index(int $post_id): JsonResponse
  {
    $post = Post::find($post_id);

    if (!$post) {
      return $this->notFoundResponse('投稿が見つかりません');
    }

    $comments = Comment::with('user')
      ->where('post_id', $post_id)
      ->orderBy('created_at', 'asc')
      ->get();

    $comments_data = $comments->map(function ($comment) {
      return [
        'id' => $comment->id,
        'user_id' => $comment->user_id,
        'user_name' => $comment->user->user_name,
        'post_id' => $comment->post_id,
        'content' => $comment->content,
        'created_at' => $comment->created_at,
      ];
    });

    return $this->successResponse($comments_data);
  }

  /**
   * リクエストからコメント内容を取得し、$comment に格納する
   *
   * @param StoreCommentRequest $request
   * @param int $post_id
   * @return JsonResponse
   */
  public function store(StoreCommentRequest $request, int $post_id): JsonResponse
  {
    $post = Post::find($post_id);

    if (!$post) {
      return $this->notFoundResponse('投稿が見つかりません');
    }

    $user = Auth::user();
    if (!$user) {
      return $this->unauthorizedResponse();
    }

    $comment = Comment::create([
      'user_id' => $user->id,
      'post_id' => $post_id,
      'content' => $request->content,
    ]);

    $comment->load('user');

    return $this->successResponse([
      'id' => $comment->id,
      'user_id' => $comment->user_id,
      'user_name' => $comment->user->user_name,
      'post_id' => $comment->post_id,
      'content' => $comment->content,
      'created_at' => $comment->created_at,
    ], 201);
  }
}
