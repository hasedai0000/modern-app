<?php

namespace App\Domain\Comment\Repositories;

use App\Models\Comment;
use Illuminate\Support\Collection;

interface CommentRepositoryInterface
{
    /**
     * @return Collection<int, Comment>
     */
    public function findByPostId(int $post_id): Collection;

    public function save(int $user_id, int $post_id, string $content): Comment;
}
