<?php

namespace App\Domain\Comment\Entities;

class CommentEntity
{
    private int $id;
    private int $user_id;
    private string $user_name;
    private int $post_id;
    private string $content;
    private string $created_at;

    public function __construct(
        int $id,
        int $user_id,
        string $user_name,
        int $post_id,
        string $content,
        string $created_at
    ) {
        $this->id = $id;
        $this->user_id = $user_id;
        $this->user_name = $user_name;
        $this->post_id = $post_id;
        $this->content = $content;
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

    public function getUserName(): string
    {
        return $this->user_name;
    }

    public function getPostId(): int
    {
        return $this->post_id;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function getCreatedAt(): string
    {
        return $this->created_at;
    }

    /**
     * @return array{id:int,user_name:string,content:string,created_at:string}
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_name' => $this->user_name,
            'content' => $this->content,
            'created_at' => $this->created_at,
        ];
    }
}


