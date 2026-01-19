<?php

namespace App\Domain\User\Entities;

class UserEntity
{
    private int $id;
    private ?string $firebase_uid;
    private string $user_name;
    private string $email;

    public function __construct(int $id, ?string $firebase_uid, string $user_name, string $email)
    {
        $this->id = $id;
        $this->firebase_uid = $firebase_uid;
        $this->user_name = $user_name;
        $this->email = $email;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getFirebaseUid(): ?string
    {
        return $this->firebase_uid;
    }

    public function getUserName(): string
    {
        return $this->user_name;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    /**
     * @return array{id:int,firebase_uid:?string,user_name:string,email:string}
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'firebase_uid' => $this->firebase_uid,
            'user_name' => $this->user_name,
            'email' => $this->email,
        ];
    }
}


