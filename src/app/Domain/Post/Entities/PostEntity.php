<?php

namespace App\Domain\Post\Entities;

class PostEntity
{
    private int $id;
    private int $user_id;
    private string $user_name;
    private string $content;
    private string $created_at;
    private int $likes_count;
    private int $comments_count;

    public function __construct(
        int $id,
        int $user_id,
        string $user_name,
        string $content,
        string $created_at,
        int $likes_count,
        int $comments_count
    ) {
        $this->id = $id;
        $this->user_id = $user_id;
        $this->user_name = $user_name;
        $this->content = $content;
        $this->created_at = $created_at;
        $this->likes_count = $likes_count;
        $this->comments_count = $comments_count;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getUserId(): int
    {
        return $this->user_id;
    }

    public function getUserName(): string
    {
        return $this->user_name;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function getCreatedAt(): string
    {
        return $this->created_at;
    }

    public function getLikesCount(): int
    {
        return $this->likes_count;
    }

    public function getCommentsCount(): int
    {
        return $this->comments_count;
    }

    /**
     * @return array{id:int,user_name:string,content:string,created_at:string,likes_count:int,comments_count:int}
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_name' => $this->user_name,
            'content' => $this->content,
            'created_at' => $this->created_at,
            'likes_count' => $this->likes_count,
            'comments_count' => $this->comments_count,
        ];
    }
}


