<?php

namespace App\Domain\User\Repositories;

use App\Models\User;

interface UserRepositoryInterface
{
    public function findByUid(string $uid): ?User;

    public function save(string $uid, string $user_name, string $email): User;
}
