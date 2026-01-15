<?php

namespace App\Domain\Like\Repositories;

interface LikeRepositoryInterface
{
    /**
     * @return array{liked: bool, likes_count: int}
     */
    public function toggle(int $user_id, int $post_id): array;
}
