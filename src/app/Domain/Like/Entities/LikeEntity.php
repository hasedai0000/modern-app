<?php

namespace App\Domain\Like\Entities;

class LikeEntity
{
    private int $id;
    private int $user_id;
    private int $post_id;
    private string $created_at;

    public function __construct(int $id, int $user_id, int $post_id, string $created_at)
    {
        $this->id = $id;
        $this->user_id = $user_id;
        $this->post_id = $post_id;
        $this->created_at = $created_at;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getUserId(): int
    {
        return $this->user_id;
    }

    public function getPostId(): int
    {
        return $this->post_id;
    }

    public function getCreatedAt(): string
    {
        return $this->created_at;
    }

    /**
     * @return array{id:int,user_id:int,post_id:int,created_at:string}
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'post_id' => $this->post_id,
            'created_at' => $this->created_at,
        ];
    }
}


