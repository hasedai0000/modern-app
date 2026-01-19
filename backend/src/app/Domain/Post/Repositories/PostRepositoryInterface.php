<?php

namespace App\Domain\Post\Repositories;

use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PostRepositoryInterface
{
    public function paginate(int $page, int $per_page): LengthAwarePaginator;

    public function findById(int $post_id): ?Post;

    public function save(int $user_id, string $content): Post;

    public function deleteById(int $post_id): bool;
}
