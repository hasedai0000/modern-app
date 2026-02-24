<?php

namespace App\Http\Controllers;

use App\Http\Requests\IndexPostRequest;
use App\Http\Requests\StorePostRequest;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
  /**
   * 投稿一覧を取得し、$posts に格納する
   *
   * @param IndexPostRequest $request
   * @return JsonResponse
   */
  public function index(IndexPostRequest $request): JsonResponse
  {
    $per_page = (int) $request->input('per_page', 15);

    $posts = Post::with('user')
      ->withCount(['likes', 'comments'])
      ->orderBy('created_at', 'desc')
      ->paginate($per_page);

    $posts_data = $posts->getCollection()->map(function ($post) {
      return [
        'id' => $post->id,
        'user_id' => $post->user_id,
        'user_name' => $post->user->user_name,
        'content' => $post->content,
        'likes_count' => $post->likes_count,
        'comments_count' => $post->comments_count,
        'created_at' => $post->created_at ? $post->created_at->toIso8601String() : null,
      ];
    });

    // ページネーション情報を保持したまま、データを変換した新しいPaginatorを作成
    $paginated_posts = new LengthAwarePaginator(
      $posts_data,
      $posts->total(),
      $posts->perPage(),
      $posts->currentPage(),
      [
        'path' => $posts->path(),
        'pageName' => $posts->getPageName(),
      ]
    );

    return $this->paginatedResponse($paginated_posts);
  }

  /**
   * リクエストから投稿内容を取得し、$post に格納する
   *
   * @param StorePostRequest $request
   * @return JsonResponse
   */
  public function store(StorePostRequest $request): JsonResponse
  {
    $user = Auth::user();
    if (!$user) {
      return $this->unauthorizedResponse();
    }

    $post = Post::create([
      'user_id' => $user->id,
      'content' => $request->content,
    ]);

    $post->load('user');
    $post->loadCount(['likes', 'comments']);

    return $this->successResponse([
      'id' => $post->id,
      'user_id' => $post->user_id,
      'user_name' => $post->user->user_name,
      'content' => $post->content,
      'likes_count' => $post->likes_count,
      'comments_count' => $post->comments_count,
      'created_at' => $post->created_at ? $post->created_at->toIso8601String() : null,
    ], 201);
  }

  /**
   * 指定された投稿を取得し、$post に格納する
   *
   * @param int $id
   * @return JsonResponse
   */
  public function show(int $id): JsonResponse
  {
    $post = Post::with('user')
      ->withCount(['likes', 'comments'])
      ->find($id);

    if (!$post) {
      return $this->notFoundResponse('投稿が見つかりません');
    }

    return $this->successResponse([
      'id' => $post->id,
      'user_id' => $post->user_id,
      'user_name' => $post->user->user_name,
      'content' => $post->content,
      'likes_count' => $post->likes_count,
      'comments_count' => $post->comments_count,
      'created_at' => $post->created_at ? $post->created_at->toIso8601String() : null,
    ]);
  }

  /**
   * 指定された投稿を取得し、$post に格納する
   * 投稿者のみ削除可能
   *
   * @param int $id
   * @return JsonResponse
   */
  public function destroy(int $id): JsonResponse
  {
    $post = Post::find($id);

    if (!$post) {
      return $this->notFoundResponse('投稿が見つかりません');
    }

    $user = Auth::user();
    if (!$user) {
      return $this->unauthorizedResponse();
    }

    if ($post->user_id !== $user->id) {
      return $this->forbiddenResponse('この投稿を削除する権限がありません');
    }

    $post->delete();

    return $this->successResponse(null, 200, ['message' => '投稿を削除しました']);
  }
}
