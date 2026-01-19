<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    /**
     * 成功レスポンスを返す
     *
     * @param mixed $data
     * @param int $status_code
     * @param array $additional
     * @return JsonResponse
     */
    protected function successResponse($data = null, int $status_code = 200, array $additional = []): JsonResponse
    {
        $response = [
            'success' => true,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        if (!empty($additional)) {
            $response = array_merge($response, $additional);
        }

        return response()->json($response, $status_code);
    }

    /**
     * エラーレスポンスを返す
     *
     * @param string $message
     * @param int $status_code
     * @param array $errors
     * @return JsonResponse
     */
    protected function errorResponse(string $message, int $status_code = 400, array $errors = []): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $status_code);
    }

    /**
     * バリデーションエラーレスポンスを返す
     *
     * @param \Illuminate\Contracts\Validation\Validator|\Illuminate\Support\MessageBag $errors
     * @param string $message
     * @return JsonResponse
     */
    protected function validationErrorResponse($errors, string $message = 'バリデーションエラー'): JsonResponse
    {
        if ($errors instanceof \Illuminate\Contracts\Validation\Validator) {
            $errors = $errors->errors();
        }

        return $this->errorResponse($message, 422, $errors->toArray());
    }

    /**
     * ページネーション付きレスポンスを返す
     *
     * @param LengthAwarePaginator $paginator
     * @param array $additional
     * @return JsonResponse
     */
    protected function paginatedResponse(LengthAwarePaginator $paginator, array $additional = []): JsonResponse
    {
        return $this->successResponse($paginator->items(), 200, array_merge([
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ], $additional));
    }

    /**
     * 認証エラーレスポンスを返す
     *
     * @param string $message
     * @return JsonResponse
     */
    protected function unauthorizedResponse(string $message = '認証が必要です'): JsonResponse
    {
        return $this->errorResponse($message, 401);
    }

    /**
     * 認可エラーレスポンスを返す
     *
     * @param string $message
     * @return JsonResponse
     */
    protected function forbiddenResponse(string $message = 'この操作を実行する権限がありません'): JsonResponse
    {
        return $this->errorResponse($message, 403);
    }

    /**
     * リソース不存在エラーレスポンスを返す
     *
     * @param string $message
     * @return JsonResponse
     */
    protected function notFoundResponse(string $message = 'リソースが見つかりません'): JsonResponse
    {
        return $this->errorResponse($message, 404);
    }
}
