<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// 認証関連（公開エンドポイント）
Route::post('/auth/register', [AuthController::class, 'register']);

// 認証必須エンドポイント
Route::middleware('firebase.auth')->group(function () {
    // ユーザー情報取得
    Route::get('/user', [UserController::class, 'show']);

    // 投稿関連
    Route::post('/posts', [PostController::class, 'store']);
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);

    // いいね関連
    Route::post('/posts/{post_id}/like', [LikeController::class, 'toggleLike']);

    // コメント関連
    Route::post('/posts/{post_id}/comments', [CommentController::class, 'store']);
});

// 公開エンドポイント（認証不要）
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{id}', [PostController::class, 'show']);
Route::get('/posts/{post_id}/comments', [CommentController::class, 'index']);
